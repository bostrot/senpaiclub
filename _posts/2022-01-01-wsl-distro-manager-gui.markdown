---
layout: post
title: Windows Subsystem for Linux (WSL) Distro Manager GUI
date: '2022-01-01 16:34:30'
tags:
- wsl
- linux
- windows
- github
- project
- flutter
---

If you are developing different software that was built on different machines or Linux distros you might have come across the issue that - especially out-of-date - code might only work with a specific distro. To counter that and other stuff Windows has, fortunately, build the Windows Subsystem for Linux which enables you to run Linux distros on Linux without a virtualization layer. They also gave the option to import a rootfs to use different distros on it. Unfortunately, it might be a bit cumbersome to get the cmds right to export a WSL instance or quickly set up a new one with a specific distro.

That is why I created a little tool that might help you with a GUI to control your instances a little better.

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/01/image.png" class="kg-image" alt loading="lazy" width="795" height="618" srcset="/assets/img/size/w600/2022/01/image.png 600w,/assets/img/2022/01/image.png 795w" sizes="(min-width: 720px) 720px"></figure>

As the name states this tool allows you to manage your instances with a GUI, quickly create new instances, stop, delete or customize them.

Interestingly Windows does not allow you to install a specific distro twice with their install command. So when you want to create a second instance with the same distro you would actually have to use a rootfs. I automated that process in my tool so it actually downloads the rootfs first into a cache and then re-uses it for new instances. This also allows adding more distros quickly in the future without relying on the Windows Store to update theirs.

For better management, you can also rename your instance labels in this instance without needing to recreate them.

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/01/image-1.png" class="kg-image" alt loading="lazy" width="795" height="618" srcset="/assets/img/size/w600/2022/01/image-1.png 600w,/assets/img/2022/01/image-1.png 795w" sizes="(min-width: 720px) 720px"></figure>

While creating this tool I came across some interesting Windows-Like behavior with WSL and I just wanted to share that:

WSL commands actually return a text with zeros and other non-ascii characters between the encoded characters. So any text that is taken directly from the command line would look like this: "C o p y r i g h t" instead of just "Copyright". I countered that by filtering non-ascii characters out and keeping only everything from 32 to 122 + newline (10). I am not sure if there is a way to circumvent that problem directly with PowerShell but other commands do not return zeros between the text so I guess Windows CMD/Powershell/Terminal account for that and just don't show the zeros in between. If you actually have an explanation for this feel free to educate me.

If you want to use this tool feel free to. It is open-source on GitHub:

<https://github.com/bostrot/wsl2-distro-manager>
