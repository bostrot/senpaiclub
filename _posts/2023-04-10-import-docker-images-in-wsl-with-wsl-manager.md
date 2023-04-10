---
layout: post
title: Import Docker images in WSL with WSL Manager
date: 2023-04-10T14:44:51.150Z
---

WSL2 (Windows Subsystem for Linux) is a powerful tool for developers who want to use Linux applications and tools on their Windows machine without having to dual-boot or set up a virtual machine. However, managing and setting up WSL2 instances can be a bit of a hassle, especially for those who are not familiar with the command-line interface.

That's where `WSL Manager` comes in. This open-source project provides a graphical user interface (GUI) for managing your WSL2 instances, making it easier for users to create, manage, and run Linux environments on Windows. And with the latest update, the project now allows users to pull Docker images and use them as rootfs to create a WSL2 instance, without the need to install Docker desktop.

Before we dive into this new feature, let's first explore what WSL2-distro-manager is and how it can help you manage your WSL2 instances more efficiently.

## What is WSL2-distro-manager?

WSL2-distro-manager is a graphical user interface (GUI) for managing your WSL2 instances on Windows 10. The project is open-source, and its code is available on GitHub. The GUI is designed to make it easy for users to manage their WSL2 instances, with features such as:

* Creating new instances
* Starting and stopping instances
* Accessing instance terminal
* Managing instance settings
* The project is built using Flutter and uses its own API to interact with the WSL2 backend.

## The latest update to WSL2-distro-manager

With the latest update to WSL2-distro-manager, users can now pull Docker images and use them as rootfs to create a WSL2 instance. This means that you can now use any Docker image as a starting point for your WSL2 instance, without the need to install Docker desktop on your Windows machine.

To use this feature, simply enter `dockerhub:alpine:latest` as the rootfs when creating a new instance. The WSL Manager will then pull the image and use it as the rootfs for your new instance.

![WSL Manager - Create new instance](/assets/img/wslmanager-docker-screenshot.png)

## Why is this feature useful?

Using Docker images as rootfs for your WSL2 instances can be incredibly useful for several reasons:

* Docker images are portable: You can easily share your WSL2 instances with others by sharing the Docker image you used as the rootfs.
* Docker images are pre-configured: Many Docker images come with pre-configured software and tools, making it easier for you to get started with your new instance.
* Docker images are versioned: You can easily switch between different versions of a Docker image to test compatibility or to use different versions of software.

## Conclusion

WSL Manager is a powerful tool for managing your WSL2 instances on Windows 11. With the latest update, users can now pull Docker images and use them as rootfs to create new instances, without the need to install Docker desktop on their Windows machine. This feature makes it easier than ever to get started with WSL2, and to share your WSL2 instances with others. If you haven't already, give WSL Manager a try and see how it can simplify your WSL2 workflow.

## Support

As an open-source project, WSL Manager is supported by the community. If you want to support the project, you can do so by:

* [Contributing to the project](https://github.com/bostrot/wsl2-distro-manager/blob/main/CONTRIBUTING.md)
* [Reporting bugs](https://github.com/bostrot/wsl2-distro-manager/issues/new/choose)
* [Suggesting new features](https://github.com/bostrot/wsl2-distro-manager/issues/new/choose)
* [Donating to the project](https://github.com/sponsors/bostrot)
* Sharing the project with others

## Resources

[WSL Manager on GitHub](https://github.com/bostrot/wsl2-distro-manager)\
[WSL Manager on the Microsoft Store](https://apps.microsoft.com/store/detail/wsl-manager/9NWS9K95NMJB?hl=en-us&gl=us)\
