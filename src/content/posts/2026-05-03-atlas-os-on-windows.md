---
layout: post
title: "Installing Atlas OS on Windows 11: A Guide for Proxmox VMs"
date: 2026-05-03T19:00:00.000Z
author: eric
tags:
  - tutorial
  - atlas-os
  - windows
  - proxmox
  - vm
  - gaming
categories: [tutorial, windows]
---


I wanted to install [Atlas OS](https://github.com/Atlas-OS/Atlas) on a Windows 11 VM in Proxmox — enjoying the benefits of an optimized, cleaned-up Windows without bloatware, with better performance and full control over the system configuration. Here's the complete guide based on my experience.

## Prerequisites

- A working Proxmox VM (Windows 11)
- [Ventoy](https://github.com/ventoy/Ventoy/releases/) on a USB stick or ISO-based boot partition
- The latest Windows 11 ISO (from Microsoft)
- Atlas Wizard Plus Playbook (from [Atlas OS Docs](https://docs.atlasos.net/getting-started/install/install-iso-injection/))

## Step-by-Step Guide

### 1. Set Up Ventoy

Download Ventoy and install it on your PC and after starting on your target USB disk:

```bash
# Or via Winget on Windows
winget install -e --id ventoy.Ventoy
```

After installation, you can simply drag and drop your ISO files onto the Ventoy disk via the file explorer.

### 2. Prepare Atlas Wizard Plus on the VM

Start your Proxmox Windows 11 VM and download the [Atlas Wizard](https://docs.atlasos.net/getting-started/install/install-iso-injection/). Follow the official docs for the latest version.

Also download the current Windows 11 ISO (see the [Atlas OS guide](https://docs.atlasos.net/getting-started/install/install-iso-injection/) for the current source).

### 3. Run the Atlas Wizard

Launch the Atlas Wizard and select your desired customization options for the installation. The process can take quite a while over a VM connection — be patient.

Once the Wizard is done, eject the virtual drive and plug the USB stick into the PC where you want to reinstall Windows.

### 4. Boot from the Ventoy Stick

Boot from the USB stick (e.g., **F12** for the boot menu — varies by motherboard). Select your stick, then choose the Windows 11 ISO you copied earlier.

> **Note:** If Secure Boot is enabled, you may encounter issues. Follow the instructions in the [Atlas OS guide](https://docs.atlasos.net/getting-started/install/install-iso-injection/) in that case.

### 5. Windows Setup — The Critical Part

Once you're in the Windows Setup:

1. Click **'Next'** twice
2. Click **'Previous version of setup'** in the bottom left corner

### 6. Disk Partitioning

In the disk selection screen: If you had a **Dynamic Disk** setup before (like I did), the installer won't let you delete the disk directly.

**Solution:**

```bash
# Shift + F10 to open the command prompt
diskpart
list disk
select disk 0
clean
```

### 7. Identify the Correct Disk

When you have multiple disks, `detail disk` helps verify you're targeting the right one:

```bash
select disk 0
detail disk
```

Check if it's the correct disk. If so, select `disk 0` in the installer and proceed with the installation.

## Troubleshooting

### Secure Boot Errors

If Secure Boot causes problems, follow the instructions in the [official Atlas OS guide](https://docs.atlasos.net/getting-started/install/install-iso-injection/).

### Dynamic Disk Not Showing in Installer

As described above, use `diskpart` with `clean` to wipe the disk. The Windows Installer cannot handle Dynamic Disks.

### Installation Takes a Very Long Time

The Atlas Wizard Plus Playbook can take significantly longer over a VM connection compared to bare metal. It's compute-intensive — patience is key.

## Final Thoughts

With Atlas OS, you can effectively optimize a Windows 11 VM in Proxmox — less bloatware, better performance, full control. The most critical part is the correct disk cleanup before installation. With the right workflow (Ventoy → Atlas Wizard → diskpart clean), it works reliably.
