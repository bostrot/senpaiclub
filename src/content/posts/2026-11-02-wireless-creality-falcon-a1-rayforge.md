---
layout: post
title: "Making the Creality Falcon A1 Wireless with an Old Orange Pi Zero and Rayforge"
date: 2026-11-02T18:00:00.000Z
author: eric
description: An old Orange Pi Zero next to the Creality Falcon A1 runs laserhop, which shares the laser's GRBL serial port over TCP and its camera as an MJPEG stream, so Rayforge on a Mac can drive the laser over Wi-Fi.
image: /assets/uploads/creality-falcon-a1.webp
tags:
  - laser
  - creality
  - falcon-a1
  - rayforge
  - grbl
  - laserhop
  - orange-pi
  - rust
categories: [wiki]
---

The Creality Falcon A1 only talks USB. I did not want a laptop next to it, so an old Orange Pi Zero that was lying around now sits next to the laser and puts it on the network.

## Setup

- **Laser:** Creality Falcon A1, GRBL 1.1f firmware, USB serial (`303a:4001`, shows up as `/dev/ttyACM0`)
- **Camera:** the built-in USB camera (`1bcf:0b19`) behind the laser's internal USB hub
- **Bridge:** Orange Pi Zero (armv7, 512 MB), Armbian, Wi-Fi
- **Client:** Mac running [Rayforge](https://rayforge.org/)

Two things have to go over the network: the serial port for the G-code and the camera. Both are handled by [laserhop](https://github.com/bostrot/laserhop), a small Rust program I wrote for this.

## laserhop

laserhop is made for old, slow boards like this one: a single static binary of about 2 MB with no Python or other runtime, and no video encoding. It runs on ARMv6 (first Raspberry Pi, Pi Zero), ARMv7, AArch64 and x86_64. It runs as a systemd service on the board next to the laser and does two things:

- **Serial port over TCP** on port `2000`, for Rayforge's *GRBL (Telnet)* driver
- **Camera as an MJPEG stream** at `http://<pi-ip>:8080/stream`, passed through without re-encoding

It also has a small status page on port `8080` showing the machine state, the connected client and a camera preview.

Install it on the Pi with the laser switched on and plugged in:

```bash
curl -fsSL https://raw.githubusercontent.com/bostrot/laserhop/main/install.sh | sudo sh
```

The installer downloads the binary for the board's architecture (armv6, armv7, aarch64 or x86_64). It then asks which serial port and which camera to share and sets up the service so it starts on boot. At the end it prints the addresses:

```
Status page:  http://192.168.3.23:8080/
Laser:        192.168.3.23 port 2000
Camera:       http://192.168.3.23:8080/stream
```

To pick other devices later, run `sudo laserhop setup`. Running the install command again updates the binary and keeps the settings.

### Why not ser2net

`ser2net` almost works, but the Falcon has one quirk. Whenever the port is opened, it prints `usb connect succeed` and rejects the next line with `error:2`. In Rayforge that first line is the homing command, so you get *Invalid Number Format* and nothing moves.

laserhop keeps the serial port open the whole time and sends one throwaway line itself after opening it, so the error is swallowed before any client connects. It also doesn't drop DTR on close, which would reset many boards. A new connection replaces the old one, so a Rayforge that crashed or lost Wi-Fi can't lock you out.

Devices are remembered by USB vendor and product id (`303a:4001` for the laser, `1bcf:0b19` for the camera), not by `/dev/ttyACM0`. If the laser is off when the Pi boots, laserhop waits and connects once it's switched on.

### Camera

The Falcon's camera delivers JPEG frames itself, so laserhop only forwards them to every viewer at the configured frame rate (1280 × 960 at 10 fps by default). The camera leaves the Huffman tables out of its frames, so laserhop adds the standard ones, which makes every frame decodable in browsers and OpenCV.

Before this I shared the camera with [VirtualHere](https://www.virtualhere.com/). It works, but the free version only shares one device and the paid licence is tied to the server hardware. A plain HTTP stream needs no client software at all.

### Security

laserhop has no authentication. Anyone who can reach the Pi can control the laser and watch the camera, so keep it on a network you trust.

## Rayforge

[Rayforge](https://rayforge.org/) is an open-source laser program (Linux, Windows, macOS). The Falcon A1 is not in its device list, so add it by hand:

**Machine setup → Configure manually → Device not listed → GRBL (Telnet)**, host `<pi-ip>`, port `2000`

For the camera, add a camera with `http://<pi-ip>:8080/stream` as the source.

Then set:

- **Work area:** 381 × 305 mm, origin bottom left
- **Max speed:** 36000 mm/min, acceleration 1000 mm/s²
- **Home on start:** on
- **Laser head:** max power (S) 1000, wavelength 455 nm, spot 0.1 mm

![Rayforge connected to the Falcon A1 over Wi-Fi: frame and start buttons highlighted](/assets/uploads/rayforge-falcon-a1.webp)

The **Frame** button (top, red box) runs the outline at low power so you can check that the material is placed correctly. Set the frame power to about 1 %. The **Start** button (bottom right) sends the job.

For 4 mm basswood, a *Contour* step at 100 % power and 250 mm/min needed two passes on my 10 W A1.

## Designs: tray inserts with Boxes.py

The parts in the screenshot are a tray insert. I don't draw these myself. I generate them with [Boxes.py](https://boxes.hackerspace-bamberg.de/), an open-source generator for laser-cut boxes run by Hackerspace Bamberg.

1. Open the **TrayInsert** generator (under *Trays*).
2. Enter the compartment sizes (`sx`, `sy`) and the height `h`, for example measured from the drawer or box the insert goes into.
3. Set `thickness` to the measured material thickness (3 or 4 mm basswood) and `burn` to your kerf (about 0.1 mm).
4. Choose SVG as the format and download.
5. In Rayforge, import the SVG, move it into the work area and assign a *Contour* step.

The generator fits the parts closely, so a 38 × 30 cm sheet holds a whole insert. Run Frame once before cutting to make sure everything is on the sheet.

## Notes

- **Honeycomb bed / head height:** to fit the honeycomb, the laser head has to go up, which means loosening its screws. Loosening them a little is not enough. They have to be unscrewed almost all the way before the head rises to the top. I didn't know this and for a while thought the A1 only had 1–2 cm of space under the head.

- **Wi-Fi:** the Orange Pi Zero's onboard Wi-Fi is weak. With a bad signal, Rayforge loses the connection mid-job. Ethernet is the better choice if a cable is possible.
- **USB:** at one point the Pi stopped seeing the laser at all. A weak power supply or a charge-only cable can cause that, so use a proper 5 V / 2 A supply and a data cable.
- **Hung controller:** if the laser stops answering on serial completely, power-cycle it. Restarting laserhop does not help.

*Cover image: Creality ([crealityfalcon.com](https://www.crealityfalcon.com/)).*
