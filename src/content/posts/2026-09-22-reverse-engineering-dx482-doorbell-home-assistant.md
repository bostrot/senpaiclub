---
layout: post
title: "Reverse Engineering the 2easy DX482 Video Doorbell for a Cloud-Free Home Assistant Integration"
date: 2026-09-22T12:00:00.000Z
author: eric
description: How the 2easy DX482 video doorbell was reverse engineered so Home Assistant can impersonate the vendor cloud, with SIP, a proprietary media proxy and raw H.264 RTP, for a fully local integration.
tags:
  - reverse-engineering
  - homeassistant
  - doorbell
  - sip
  - rtp
  - h264
  - python
  - smarthome
categories: [wiki]
---

The 2easy (Video-Tech / V-Tec) DX482 is a 2-wire video intercom monitor with Wi-Fi. Its only smart feature is the vendor's *VDP Connect* app, which rings your phone when someone presses the door station and lets you see video and open the door. Every bit of that goes through a server in Alibaba Cloud (`47.91.88.33`). No API, no RTSP, no MQTT, no local anything.

I wanted the ring, the video and the unlock in Home Assistant, on my LAN, with the internet cable pulled if I felt like it. This post is the story of how I got there: what is inside the device, the wrong turn I took first, how the cloud protocol was pulled apart, and how Home Assistant ended up *pretending to be the vendor cloud*.

The result is a HACS integration: [bostrot/hacs-dx482-doorbell](https://github.com/bostrot/hacs-dx482-doorbell).

## Step 0: Where to even begin

There was no documentation, no API, and the vendor's own web presence is a handful of PDF manuals. So the first question was not "how do I talk to it" but "how does the *app* talk to it", because the app is the only client that exists.

I pulled the VDP Connect APK apart first. It is a **Linphone-based SIP client** wrapped in a thin Java UI. On login it registers with `sip.vdpconnect.com` over TLS, and the door station shows up as a SIP contact. Three things fell out of the decompiled code straight away:

- Opening the door during a call is plain **DTMF**: `1#` for relay 1, `2#` for relay 2.
- There is a class the app calls *MediaServer*: a TCP client for **port 8850** that logs in with credentials handed out by the cloud during a call, and sends control frames of the form `10 10 01 00` plus a little-endian sub-command (`1` unlock, `5` and `6` IP-camera list and switch, `7` light). This looked like the interesting part and it was.
- The app also does **LAN discovery** by multicasting the magic string `SWITCH` to `236.6.6.1:25007`, and can pull video directly from the device on the same network. The media that comes back is raw negotiated RTP with no container, which is awkward to consume, so I noted it and moved on.

At that point I had a rough map: SIP for signalling, a proprietary proxy for control and media, and a cloud in the middle of both. What I did not yet know was whether the device had any *local* interface that would let me skip all of that.

## Step 1: Getting a shell

The DX482 is an **Anyka AK376xD** SoC running Linux 4.4 and, like a lot of Chinese intercom hardware, it ships with FTP and telnet enabled. User `root`, empty password. That is the whole security model, so keep these on an isolated IoT VLAN.

```bash
ftp 192.168.3.254      # user root, no password
telnet 192.168.3.254   # same
```

The interesting parts of the filesystem:

| Path | What it is |
|---|---|
| `/mnt/nand1-1/App/` | the firmware application and its resources |
| `/mnt/nand1-1/App/res/io_data_default_table.csv` | a ~300-row table of every setting: parameter id, default, min, max |
| `/mnt/nand1-2/Settings/io_data_value.json` | user overrides for those settings, `{"value": {"<paraId>": "<string>"}}` |
| `/mnt/nand1-2/Settings/sipcfg.cfg` | SIP accounts and the server the device dials into |
| `/mnt/nand1-2/UserData/call_record_table.csv` | the call log, one row per door call |

The settings table alone was a gift. Unlock time, ring duration, volumes, do-not-disturb, auto-unlock hours: all just a number in a JSON file, read once at boot. Write the file over FTP, `sync; reboot` over telnet, done. That later became the number, switch and select entities in the integration.

The binary in `App/` also contained the string `Linphone 3.6.1`. That was the first hint that the "cloud" is really just SIP.

## Step 2: The wrong turn (TCP 8765)

With a shell, the obvious next move was a port scan and a look at what the firmware binary listens on. Two things jumped out and both looked like the local dream: an **RTSP server on port 554** with default credentials `admin` / `1234abcd` and channels `101` and `102`, and a listener on **TCP port 8765** speaking a small binary command protocol that the firmware dispatches on a numeric id.

The RTSP server answered, but it is not where the door-station video lives. The DX482 only ever pushes video through the proxy path described later; the RTSP endpoint is a leftover of the SoC vendor's SDK. So that left port 8765. Each request is a 4-byte little-endian "dispatcher" id plus a payload; the reply carries a 10-byte header (`op`, `sid`, `rsp`, `len`, `chk`) and data.

```
0x06  door trigger (momentary unlock pulse)
0x08  door lock / unlock
0x0B  JPEG capture  -> returns a JPEG frame
0x0D  door state
0x10  battery
0x11  call log
0x12  LED
0x15  relay
0x1B  Wi-Fi RSSI
```

I built the first version of the integration on this. It worked, sort of: unlock, a snapshot on demand, a door-state sensor. But the port has real problems:

- The handler is **single-threaded and fragile**. It accepts one command per TCP connection and crashes the whole app if you send a second one too quickly. Every call had to open a fresh socket, and everything was serialised behind a lock with a cooldown.
- There is **no push**. Ring detection meant polling the call log a few times a second, which is exactly the kind of load that crashed it.
- There is **no live video**, only stills.

That first attempt lives in the git history as the initial commit, with an RTSP camera and a webhook for ring events, and was thrown away the next day. The lesson: a debug port that happens to be open is not the same thing as the interface the device is designed to serve.

## Step 3: It's SIP, and the cloud is a proxy

`sipcfg.cfg` explained the real architecture:

```ini
[server]   = 47.91.88.33:5068
[serverIp] = 47.91.88.33:5068
[account]  = 64000002db48     ; the doorbell's own SIP identity
[divert]   = 6e000002db48     ; the "phone" identity the app logs in as
[VTK_AUTO_REG_SERVER_IPADD2] = 47.91.88.33
[VTK_AUTO_REG_SERVER_IP2]    = 47.91.88.33:5068
```

Two SIP accounts. The monitor registers as `64…`. The phone app is `6e…`. When you press the button at the door and divert is on, the monitor simply **places a SIP call from `64…` to `6e…`** through the vendor's registrar. A ring is an `INVITE`. That is the whole notification system.

Video was the harder part. The DX482 is *not* a normal SIP video phone. The SDP in its `INVITE` is decorative; it never streams RTP to whatever the SDP says. Instead, during any call it opens a second connection to **TCP port 8850 on the same server**, logs in, and only over that link will it accept commands (unlock, start video, light) and push H.264. Away from home the app never talks to the doorbell directly; the cloud relays everything.

So to go local I would have to become both the registrar and the media proxy.

## Step 4: Reverse engineering the proxy protocol

The SIP side is standard enough that reading RFC 3261 and watching the device was sufficient. The proxy link on 8850 is a private binary protocol, and the only two places it exists are the doorbell firmware and the VDP Connect Android app.

The approach was two-pronged:

1. **Back to the decompiled app.** The Java side of VDP Connect contains the frame builders for login and control commands, with field offsets and sizes in plain sight. That gave the *shape* of every frame.
2. **Capture a real session.** With the doorbell still pointed at the vendor cloud, a packet capture of one ring plus one unlock from the app showed the *actual bytes*, the ordering, and one thing the app code does not tell you: which replies the doorbell insists on before it will do anything.

The wire format, little-endian throughout:

```
device -> proxy   LOGIN      02 10 xx 00 | acct[31] @4 | pwd[15] @36 | rel[31] @52       (84 B)
proxy  -> device  LOGIN OK   03 10 xx 00 | same 80 bytes | audioPort u16 | videoPort u16 | 00 00   (90 B)
device -> proxy   STATUS     00 40 00 00 | 01 00 06 00 01 00 00 00 00 00        (bit 0x40 = device-initiated)
proxy  -> device  STATUS OK  00 20 00 00 01 00 00 00                            (mandatory!)
proxy  -> device  CTRL       10 10 01 00 | sub u16 | payload
device -> proxy   CTRL ACK   11 10 sid  | sub u16 | ...
```

Control sub-commands:

| sub | meaning | payload |
|---|---|---|
| 1 | unlock | relay index, u16 |
| 2 | DTMF / monitor code | `"<code>#"` as ASCII, this starts video |
| 4 | push-to-talk | |
| 5, 6 | IP camera list / switch | |
| 7 | light | index, u16 |

Two details cost the most time and both came from the capture, not the decompile:

- The **login reply hands the doorbell the UDP ports** it should push RTP to. Whatever you put at offset 84 and 86 of `LOGIN OK` is where the H.264 arrives. That is how the cloud steers media, and it is what lets Home Assistant pick its own ports.
- After login the device sends a **status frame and waits for the 8-byte `STATUS OK`**. If you do not answer it, the link stays up, commands are silently ignored and no video ever comes. Nothing in the app code hints at this because the app never sees it; it is proxy-to-device only.

The monitor code (`moncode`, usually `0x34`, so the DTMF string is `34#`) is the same value that is baked into the QR code the app scans. Sending it as sub-command 2 is exactly what the app does when you tap "monitor".

## Step 5: Becoming the cloud

With the protocol known, the plan was simple: edit four lines in `sipcfg.cfg` to point `[server]` at the Home Assistant host, reboot the doorbell, and run three listeners in Home Assistant:

| Doorbell expects | Home Assistant provides |
|---|---|
| SIP registrar at `[server]`, udp/5068 | a minimal registrar that answers `REGISTER` |
| media proxy at `[server]`, tcp/8850 | the login / status / control handshake above |
| somewhere to push H.264 RTP | a UDP port, fanned out to ffmpeg |

Everything is plain `asyncio`, no SIP library. The whole session object is about 500 lines.

### The registrar

The `REGISTER` handling looks trivial and was not. The doorbell drops the registration unless the `200 OK` looks *exactly* like what the vendor sends: echoed `Via`, `From`, `To`, `Call-ID` and `CSeq`, **no `To` tag**, its own `Contact` echoed back untouched, and `Expires: 3600`. A textbook-correct response with a `To` tag makes it re-register in a loop. Three commits in the history are just "mirror the accepted REGISTER reply format".

It also sends a 3-byte `jaK` keepalive on the SIP port every few seconds, which must be ignored rather than parsed.

### Starting a session from our side

For video or unlock on demand, Home Assistant is the caller: it sends an `INVITE` straight to the doorbell on **udp/5069** from the `6e…` identity with a small SDP offer (PCMU/PCMA audio, H.264 video, `recvonly`). The doorbell answers, then dials into our proxy on 8850, logs in, sends its status frame, gets the `STATUS OK`, and from then on accepts control frames. Send `34#` and RTP starts flowing to the video port from the login reply.

A ring is the mirror image: the doorbell `INVITE`s us. We answer `100 Trying` and `180 Ringing`, fire the Home Assistant `event` entity, and optionally auto-answer with `200 OK` so the proxy link comes up immediately and a snapshot is ready before the notification goes out.

### Video: RTP to ffmpeg to a camera entity

The H.264 arrives as RTP per RFC 6184. The integration depacketises it itself: single NAL units, STAP-A aggregates and FU-A fragments are rebuilt into Annex-B byte stream (`00 00 00 01` start codes). SPS and PPS are cached so a consumer that joins mid-stream can be primed and decode from the next IDR.

That Annex-B stream is served on a local TCP port, and Home Assistant's ffmpeg camera reads it as `-f h264 tcp://127.0.0.1:<port>`. Getting ffmpeg to accept it needed the input options *before* the input, which Home Assistant's ffmpeg helper does not do for you, so the input string carries them. A ten-line SPS parser reports the stream resolution on a diagnostic sensor, mostly so you can tell "no video" from "video but nothing decodes".

## Step 6: Ring detection without divert

The SIP ring only exists if divert is enabled on the monitor, and divert has side effects (the monitor itself rings differently). Two more things came out of the firmware digging:

- `call_record_table.csv` gets a new row on every door-station press regardless of divert. Polling it over FTP every 3 seconds gives cloud-free ring detection with zero device configuration, at the cost of a few seconds of latency. This is on by default.
- The call scene is parameter `1040` in the settings table (`0` normal, `3` divert if no answer, `4` divert always) and, unlike most settings, the app re-reads it without a reboot. So there is a *Call mode* select entity, and setting it to "Divert always" from Home Assistant gets you the instant SIP ring path.

## What it looks like now

Entities: an `event` and a momentary `binary_sensor` for the ring, a `camera`, buttons for unlock 1, unlock 2, light and hang-up, a reboot button, "point at Home Assistant" and "restore cloud" buttons that rewrite `sipcfg.cfg` for you, and number, switch and select entities for the settings that matter. Diagnostics show registered, call state, proxy state, video state and last ring.

Ports Home Assistant needs to bind: UDP 5068, TCP 8850, UDP 30000 and 30002, all configurable. The doorbell must be able to reach them, which on an isolated IoT VLAN means Home Assistant's own IP, never a hostname.

While the doorbell points at Home Assistant, the vendor app is dead. Restoring the original `sipcfg.cfg` and rebooting brings it back.

## Lessons

- **Look for the intended interface, not the first open port.** Port 8765 was real and it was a trap. The device is a SIP phone with a proprietary side channel; treating it as anything else fights the firmware.
- **Decompile for structure, capture for truth.** The app told me the frame layouts. Only the packet capture showed the mandatory status handshake and the port-steering in the login reply.
- **Mirror, do not improve.** A more correct SIP response broke registration. Embedded SIP stacks are string matchers, not RFC implementations.
- **Config files beat APIs.** Half the integration's features are "write a JSON file over FTP and reboot". Boring, robust, no protocol to break.

## Get the integration

Everything described here is packaged as a Home Assistant custom integration, MIT licensed:

**→ [github.com/bostrot/hacs-dx482-doorbell](https://github.com/bostrot/hacs-dx482-doorbell)**

Install it through HACS by adding the repository as a custom repository (category
*Integration*), then add **DX482 Doorbell** from *Settings → Devices & Services*. The
README covers the setup fields, the one-time "point the doorbell at Home Assistant"
step and the ports Home Assistant needs to bind.

Bug reports, packet captures and pull requests are welcome in the
[issue tracker](https://github.com/bostrot/hacs-dx482-doorbell/issues) — especially from
anyone running a different monitor from the family below.

## Other devices

The integration has nothing DX482-specific in it. Anything from Video-Tech that uses the VDP Connect app and the same cloud address should work: the CDVI CDV-47DX and CDV-470DX rebrands, the older DX471, DX470 and DX47 on firmware V1.8 or newer, the DH473 in its VDP Connect variant, and possibly the Ethernet IX series. None are confirmed. If you own one, there is a [device report template](https://github.com/bostrot/hacs-dx482-doorbell/issues/new?template=device-report.yml) in the repo, and a checklist in the README to see whether yours is a candidate.

No vendor code is included in the integration. It exists so that people can use hardware they own without a server on another continent in the loop.
