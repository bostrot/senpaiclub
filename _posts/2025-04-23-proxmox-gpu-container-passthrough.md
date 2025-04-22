---
layout: post
title: "Running LLMs Inside a Proxmox LXC with GPU Passthrough on UM 780 XTX"
date: 2025-03-16T10:15:00.000Z
author: eric
categories: [wiki, proxmox, llm, gpu, containers]
---

I wanted to run LLMs inside a container on my UM780 XTX mini PC using Proxmox. I also wanted GPU acceleration, so I set up GPU passthrough to an LXC container. The goal was to get a clean, minimal setup working using AMD hardware — specifically passing through the integrated GPU to the container.

This post documents the working configuration, some of the commands I used, and what I ran into when trying to do it the "normal" way via VM passthrough (which didn’t go well). In case anyone else or a future me wants to this.

---

## Setting up the Debian LXC Container

I used the [Proxmox Community Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=debian) to create a Debian LXC container.

Below is the relevant snippet from `/etc/pve/lxc/102.conf`. This is where most of the container’s hardware and permissions are configured.

```
arch: amd64
cores: 6
features: nesting=1
hostname: llm-container
memory: 49152
mp0: /mnt/nvme1/downloads/models,mp=/mnt/llm-models
net0: name=eth0,bridge=vmbr0,hwaddr=BC:24:11:4C:FC:FB,ip=dhcp,type=veth
onboot: 1
ostype: debian
rootfs: local-lvm:vm-102-disk-0,size=200G
swap: 512
tags: community-script;os
lxc.apparmor.profile: unconfined
lxc.cgroup.devices.allow: a
lxc.cap.drop:
lxc.cgroup.devices.allow: c 188:\* rwm
lxc.cgroup.devices.allow: c 189:\* rwm
lxc.cgroup.devices.allow: c 226:\* rwm
lxc.cgroup.devices.allow: c 10:229 rwm
lxc.mount.entry: /dev/serial/by-id  dev/serial/by-id  none bind,optional,create=dir
lxc.mount.entry: /dev/ttyUSB0       dev/ttyUSB0       none bind,optional,create=file
lxc.mount.entry: /dev/ttyUSB1       dev/ttyUSB1       none bind,optional,create=file
lxc.mount.entry: /dev/ttyACM0       dev/ttyACM0       none bind,optional,create=file
lxc.mount.entry: /dev/ttyACM1       dev/ttyACM1       none bind,optional,create=file
lxc.mount.entry: /dev/dri/card1      dev/dri/card1      none bind,optional,create=file 0 0
lxc.mount.entry: /dev/dri/renderD128 dev/dri/renderD128 none bind,optional,create=file 0 0
lxc.mount.entry: /dev/kfd            dev/kfd            none bind,optional,create=file 0 0
```

---

## Host Configuration: Enabling GPU Access

To allow the container to access the GPU properly, you need to set device permissions on the host.

Create a UDEV rule to grant ownership of the GPU devices to the container user:

```bash
nano /etc/udev/rules.d/99-gpu-passthrough.rules
```

Inside that file:

```
KERNEL=="card1", SUBSYSTEM=="drm", MODE="0660", OWNER="100000", GROUP="100000"
KERNEL=="renderD128", SUBSYSTEM=="drm", MODE="0660", OWNER="100000", GROUP="100000"
```

The UID and GID `100000` correspond to the root user inside the unprivileged container.

To apply the new rules:

```bash
udevadm control --reload-rules
udevadm trigger
```

Install the necessary kernel modules and tools:

```bash
apt update
apt install --no-install-recommends \
  linux-modules-extra-\$(uname -r) \
  linux-firmware
```

This ensures that `amdgpu.ko` and other kernel modules are available and match your running kernel.

Install Vulkan and OpenCL libraries:

```bash
apt install --no-install-recommends \
  libvulkan1 \
  mesa-vulkan-drivers \
  vulkan-tools \
  mesa-utils \
  libgomp1
```

Load the AMD GPU module:

```bash
modprobe amdgpu
```

Check that it loaded:

```bash
lsmod | grep amdgpu
```

You should also see `amdgpu` listed when inspecting the GPU:

```bash
lspci -nnk -s <PCI-ID>
```

---

## Installing Dependencies Inside the Container

Update and install runtime packages for Vulkan and optionally OpenCL:

```bash
apt update
apt install -y \
  libvulkan1 \
  mesa-vulkan-drivers \
  vulkan-tools \
  mesa-utils \
  libdrm2 \
  libgbm1 \
  libx11-6 \
  libgomp1 \
  ocl-icd-libopencl1 \
  clinfo
```

Also install Hugging Face CLI and git:

```bash
sudo apt-get install python3-pip git
git config --global credential.helper store
pip install -U "huggingface_hub[cli]"
echo 'export PATH=\$PATH:/home/eric/.local/bin' >> ~/.bashrc
source ~/.bashrc
```

Add users to a media group (useful for shared device access):

```bash
sudo groupadd media_group
sudo usermod -aG media_group root
sudo usermod -aG media_group eric
```

After make sure to get the vulkan release of e.g. llama.cpp so it actually uses vulkan drivers.

---

## The VM Passthrough Headache

Before doing this container setup, I tried to pass the GPU directly to a **VM**. But it failed with the card being stuck in a state where the **amdgpu kernel driver was still bound to the host** and wouldn't release for passthrough.

Turns out I wasn’t alone. I had the same issue described by this user:

[https://github.com/isc30/ryzen-gpu-passthrough-proxmox/discussions/27#discussioncomment-12909830](https://github.com/isc30/ryzen-gpu-passthrough-proxmox/discussions/27#discussioncomment-12909830)

If you want to attempt that approach, you should definitely read this GitHub thread, which documents various AMD and Ryzen passthrough setups:

[https://github.com/isc30/ryzen-gpu-passthrough-proxmox/issues/16](https://github.com/isc30/ryzen-gpu-passthrough-proxmox/issues/16)

---

## Why LXC Worked Better

For me, switching to a container-based approach avoided all the PCI passthrough and IOMMU complexity. The performance is close to native, and the setup is significantly simpler — especially when using integrated graphics like on the UM780.

---

## Sources and References

- [isc30/ryzen-gpu-passthrough-proxmox/issues/16](https://github.com/isc30/ryzen-gpu-passthrough-proxmox/issues/16)
- [isc30/ryzen-gpu-passthrough-proxmox/discussions/27](https://github.com/isc30/ryzen-gpu-passthrough-proxmox/discussions/27#discussioncomment-12909830)
- [H3rz3n/proxmox-lxc-unprivileged-gpu-passthrough](https://github.com/H3rz3n/proxmox-lxc-unprivileged-gpu-passthrough)
