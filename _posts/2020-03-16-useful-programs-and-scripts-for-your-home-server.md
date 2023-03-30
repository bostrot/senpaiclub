---
layout: post
title: Useful programs and scripts for your Home Server
date: '2020-03-16 23:20:06'
tags:
- linux
- productivity
- raspberry-pi
- home-server
---

Running multiple home servers in many form-factors for several years I came across dozens of useful programs that may help you to set it up or maintain it. Here I will list some of them - and for each a quick guide on the installation and maybe some useful commands - as a reference for myself and others. I will also update it from time to time if I find some new. As I am using mostly my Raspberry Pi's I will use the user `pi`, the user and group id `1000` in all commands.

Also before using any scripts in general I want to remind you that you should always examine downloaded scripts before running them.

<!--kg-card-end: markdown--><!--kg-card-begin: markdown-->
- 

chocolately

  - Programs I got on my workstation

    choco install googlechrome firefox 7zip python3 vlc git everything avidemux etcher android-sdk vscode crystaldiskinfo discord origin bulk-crap-uninstaller steam-client keepass origin epicgameslauncher icue autohotkey autodesk-fusion360 krita goggalaxy gpg4win kopiaui obs-studio openconnect-gui openvpn pdf24 postman powertoys resilio-sync-home ubisoft-connect cura-new unity-hub visualstudio2022community webex wireshark wiztree aescrypt microsoft-office-deployment anki nodejs adobereader filezilla microsoft-windows-terminal curl inkscape winscp chocolateygui virtualbox anydesk audacity docker-desktop signal telegram flutter speedtest rufus.portable selenium cpu-z wsl2 lastpass wiztree altdrag gpu-z f.lux nordvpn grepwin nvs powertoys DNSDataView WhoisThisDomain curl alldup dns-benchmark hostsman nmap discord

- 

docker

  - [Installation](https://docs.docker.com/install/linux/docker-ce/debian/) using convenience script

    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker pi # relog after this

  - Useful commands  
`docker run hello-world`  
`docker ps`  
`docker logs <container id>`
- 

[docker-compose](https://docs.docker.com/compose/)

  - Installation  
`sudo apt install docker-compose`
  - Useful commands  
`docker-compose up -d` (without -d for logs)  
`docker-compose down`
  - Example `docker-compose.yml`

    version: '2.0'
    services:
      web:
        build: .
        ports:
        - "5000:5000"
        volumes:
        - .:/code
        - logvolume01:/var/log
        links:
        - redis
      redis:
        image: redis
    volumes:
      logvolume01: {}

- 

NodeJS 13.x

  - [Installation](https://github.com/nodesource/distributions#debinstall)

    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt-get install -y nodejs

  - Useful commands  
`node <file>`  
`npm run`  
`npm init`
- 

nodemon

  - Description  
nodemon restarts your application after a change in the current folder
  - Installation  
`npm i -g nodemon`
  - Usage  
`nodemon <file>`
- 

pm2

  - Description  
pm2 is a process manager with load balancer
  - Installation  
`npm install pm2 -g`
  - Useful commands  
`pm2 status`  
`pm2 logs <id>`  
`pm2 start <file>`  
`pm2 start <file> -- <extra parameters>`
- 

ssh tunnel

  - Description  
while ssh is already installed on most systems its tunnel feature can be used as a cheap way to forward traffic from a local host behind a firewall over a vps to the public
  - Usage  
`ssh -tt -R 0.0.0.0:<server port>:localhost:<local port> root@host -i /home/pi/.ssh/id_rsa -N`
  - Server settings  
Edit `/etc/ssh/sshd_config` and set `GatewayPorts yes`
<!--kg-card-end: markdown-->

Have you come across a useful command or program that I did not list here? Then please leave a comment so that I can add it to the list.

