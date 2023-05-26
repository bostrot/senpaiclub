---
layout: post
title: Systemd with WSL2 but not really
date: 2022-04-17T09:00:00.000Z
tags:
- wsl
- systemd
---

Just a short article about fake systemd with WSL2.

As WSL currently does not have official systemd support (although in the future that might come) I stumbled across an interesting GitHub project by [GitHub@kvaps](https://github.com/kvaps/fake-systemd) which takes the usual systemctl commands and replaces them with a bash script.

So where you might have used '_systemctl start apache2'_ the systemctl part is an extra script that handles the start command a little differently than the original. It makes direct use of the '_start-stop-daemon_' to start and stop your processes in the background.

Now I have adjusted the script a little so that enabled services on your WSL instance and some LXC containers (at least most Turnkey containers) will auto-start when the console is opened:

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/04/image-1.png" class="kg-image" alt loading="lazy" width="1484" height="793" srcset="/assets/img/size/w600/2022/04/image-1.png 600w,/assets/img/size/w1000/2022/04/image-1.png 1000w,/assets/img/2022/04/image-1.png 1484w" sizes="(min-width: 720px) 720px"></figure>

This actually works surprisingly well. With the Turnkey WordPress 16.1 container I tried, I could actually manage an easy setup. The only thing I had to block was following services that interrupted the WSL startup or networking in some kind:

<!--kg-card-begin: markdown-->

    networking.service
    rsyslog.service
    inithooks.service
    shellinabox.service
    *stunnel4*
    rsync.service

<!--kg-card-end: markdown-->

You can try this with v1.0.0 of my project [bostrot/wsl2-distro-manager: A GUI to quickly manage your WSL2 instances (github.com)](https://github.com/bostrot/wsl2-distro-manager).

Select an LXC container (e.g. Turnkey Wordpress 16.1):

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/04/image-2.png" class="kg-image" alt loading="lazy" width="796" height="618" srcset="/assets/img/size/w600/2022/04/image-2.png 600w,/assets/img/2022/04/image-2.png 796w" sizes="(min-width: 720px) 720px"></figure>

After downloading and creating the instance you will see the following message:

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/04/image-3.png" class="kg-image" alt loading="lazy" width="733" height="62" srcset="/assets/img/size/w600/2022/04/image-3.png 600w,/assets/img/2022/04/image-3.png 733w" sizes="(min-width: 720px) 720px"></figure>

This is the part where my [fork of fake-systemd](https://github.com/bostrot/fake-systemd) is installed on the new instance.

After everything is done and you start the instance for the first time you get prompted to enter the default passwords as it is the default with turnkey containers. With the first start it actually starts with the `turnkey-init` command instead of the normal console so that we get the following:

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/04/image-4.png" class="kg-image" alt loading="lazy" width="1483" height="793" srcset="/assets/img/size/w600/2022/04/image-4.png 600w,/assets/img/size/w1000/2022/04/image-4.png 1000w,/assets/img/2022/04/image-4.png 1483w" sizes="(min-width: 720px) 720px"></figure>

And voilà, wordpress installed on wsl:

<figure class="kg-card kg-image-card"><img src="/assets/img/2022/04/image-5.png" class="kg-image" alt loading="lazy" width="1019" height="949" srcset="/assets/img/size/w600/2022/04/image-5.png 600w,/assets/img/size/w1000/2022/04/image-5.png 1000w,/assets/img/2022/04/image-5.png 1019w" sizes="(min-width: 720px) 720px"></figure>

<https://www.microsoft.com/store/productId/9NWS9K95NMJB>\
<https://github.com/bostrot/wsl2-distro-manager>
