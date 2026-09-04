---
layout: post
title: "Remote LineageOS build with VPS and remote ADB extraction"
date: 2025-03-16T10:15:00.000Z
author: eric
categories: [wiki, lineageos, android]
---

## Motivation: Remote LineageOS builds using Hetzner VPS

Building custom ROMs like LineageOS locally can take time and resources, even if you have powerful hardware. While I have a powerful Mac M2 Max at home, I was looking for a quick and convenient solution without dealing with VMs & dependency downloads.

That's why I opted for using a remote VPS from Hetzner (affiliate: get €20 starting credit [here](https://hetzner.cloud/?ref=iFwjbW8nnaVX)), which allows quickly spinning up powerful build instances paid by the hour. You can spin them up, build LineageOS remotely, and delete them immediately afterward to avoid unnecessary charges. Of course, any other VPS provider offering hourly billing would also work.

## Quick overview of remote building steps

Here's my general workflow:

- **Create** a virtual server instance on Hetzner (hourly billing).
- **Setup** build environment for LineageOS.
- **Build** the LineageOS image for an older Android device (Samsung Galaxy S9, codename: starlte).
- **Extract** proprietary files from my local phone connected to my Mac via ADB through SSH tunneling.

Doing it remotely on a VPS was faster for me than setting everything up locally.

## Remote ADB extraction using SSH tunnel

Since my physical device was connected to my Mac locally, I needed the remote Ubuntu server to connect to it via ADB. I solved this with an SSH reverse tunnel.

### Steps to set up remote ADB access:

**On your local Mac:**
```bash
# Start the adb server
adb start-server

# Setup SSH reverse tunnel to the remote Ubuntu server
ssh -R 5037:localhost:5037 <user>@<remote-ubuntu-ip-or-hostname>
```

**On the remote Ubuntu VPS:**
```bash
# Stop local adb server if running
adb kill-server

# Point adb client to your Mac's adb server via SSH tunnel
export ADB_SERVER_SOCKET=tcp:localhost:5037

# Verify your device is now visible remotely
adb devices
```

### Enabling ADB root for file extraction

For successful proprietary file extraction (especially `./extract-files.sh`), make sure ADB root access is enabled on your Android device:

```bash
adb root
```

If you encounter a permission error, enable root access in your device's developer settings first:

```
Settings -> System -> Developer options -> Rooted debugging
```

Then try again:

```bash
adb root
```

Once root access is enabled, extracting files remotely from your local phone is straightforward:

```bash
./extract-files.sh
```

After extraction completes successfully, you can continue your remote LineageOS build according to the [official LineageOS build guide](https://wiki.lineageos.org/devices/starlte/build/).

## Conclusion

This approach gives you the best of both worlds: easy device connectivity on your local Mac and powerful build capabilities in the cloud, all without permanently cluttering your local environment.

