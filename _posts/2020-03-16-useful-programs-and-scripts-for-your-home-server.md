---
layout: post
title: Useful programs and scripts for your Home Server
date: 2020-03-16T09:00:00.000Z
author: eric
tags:
- linux
- productivity
- raspberry-pi
- home-server
categories: [blog]
---

# Essential Home Server Programs and Commands

Over the years, I've operated multiple home servers across various form-factors and have discovered numerous valuable programs that might be useful for setting up or maintaining your home server. In this guide, I'll share a list of these tools along with a quick installation guide and a few handy commands for each.

Please note that most of the examples in this guide are based on my experiences with Raspberry Pi's, thus the examples will use `pi` as the user and `1000` as the user and group id.

**Important**: Always ensure to examine any scripts thoroughly before running them to ensure they are safe and will not harm your system.

## Chocolately

Chocolately is a versatile package manager that I use to install and manage various software on my workstation.

```shell
choco install googlechrome firefox 7zip python3 vlc git everything avidemux etcher android-sdk vscode crystaldiskinfo discord origin bulk-crap-uninstaller steam-client keepass origin epicgameslauncher icue autohotkey autodesk-fusion360 krita goggalaxy gpg4win kopiaui obs-studio openconnect-gui openvpn pdf24 postman powertoys resilio-sync-home ubisoft-connect cura-new unity-hub visualstudio2022community webex wireshark wiztree aescrypt microsoft-office-deployment anki nodejs adobereader filezilla microsoft-windows-terminal curl inkscape winscp chocolateygui virtualbox anydesk audacity docker-desktop signal telegram flutter speedtest rufus.portable selenium cpu-z wsl2 lastpass wiztree altdrag gpu-z f.lux nordvpn grepwin nvs powertoys DNSDataView WhoisThisDomain curl alldup dns-benchmark hostsman nmap discord
```

## Docker

Docker is an open-source platform for automating the deployment, scaling, and management of applications. Here's how to install Docker using the convenience script:

```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi # relog after this
```

Here are some useful Docker commands:

```shell
docker run hello-world
docker ps
docker logs <container id>
```
