---
layout: post
title: 'QT on WSL2: reMarkable coding on Windows'
date: '2022-07-21 18:53:21'
tags:
- wsl
- qt
- remarkable
---

 **Get started with the reMarkable toolchain:**

This toolchain is actually from the official reMarkable team. We just need to download and execute it as follows:

    wget https://remarkable.engineering/deploy/sdk/sumo_qt5.12_toolchain.sh
    sudo chmod +x sumo_qt5.12_toolchain.sh && ./sumo_qt5.12_toolchain.sh

In order to access the toolchain, we now need to source the folder every time we actually want to use it. (you could make it permanent too though) Depending on which path you chose earlier this might look a bit different:

    source /usr/local/oecore-x86_64/environment-setup-cortexa9hf-neon-oe-linux-gnueabi

**Install QT Creator (GUI) on WSL2**

First a few dependencies:

<figure class="kg-card kg-code-card"><pre><code class="language-bash">sudo apt-get install -y --no-install-recommends libegl1-mesa libfontconfig libglu1-mesa libsm6 libxi6 libxrender1 mesa-common-dev
# these are optional if you want to remove qt lib warnings:
sudo apt install -y nvidia-340 mesa-utils &amp;&amp; glxgears</code></pre>
<figcaption>2</figcaption></figure>

Then qtcreator:

    sudo apt install qtcreator

Now we could try to start it but it will only show errors as there is currently no display connected. In order to get a display working, we can install an xserver variant on windows. I used VcXsrv as it includes creating firewall entries automatically. &nbsp;You can find the source [here](/p/d8013e24-f288-4384-8c2e-7386aeaa9a0f/VcXsrv%20Windows%20X%20Server%20download%20|%20SourceForge.net). After installing, start it with XLaunch, accept the firewall entries (if prompted) and go through the setup: `display number: 0`, `Start no client` and select `Disable access control`. Now you should be good to go back to the WSL console and start qtcreator on your windows host with `qtcreator`:

<figure class="kg-card kg-image-card"><img src="/assets/img/2021/01/image.png" class="kg-image" alt loading="lazy" width="1482" height="797" srcset="/assets/img/size/w600/2021/01/image.png 600w,/assets/img/size/w1000/2021/01/image.png 1000w,/assets/img/2021/01/image.png 1482w" sizes="(min-width: 720px) 720px"></figure><figure class="kg-card kg-image-card"><img src="/assets/img/2021/01/image-1.png" class="kg-image" alt loading="lazy" width="2000" height="1085" srcset="/assets/img/size/w600/2021/01/image-1.png 600w,/assets/img/size/w1000/2021/01/image-1.png 1000w,/assets/img/size/w1600/2021/01/image-1.png 1600w,/assets/img/2021/01/image-1.png 2056w" sizes="(min-width: 720px) 720px"></figure>

Now the Qt creator compiler settings ( `Tools -> Options -> Kits`):

<!--kg-card-begin: markdown-->
- Qt Versions  
Name: `rM Qt %{Qt:Version} (qt5)`  
Path: `/usr/local/oecore-x86_64/sysroots/x86_64-oesdk-linux/usr/bin/qt5/qmake`
- Compilers: (with both `Add -> GCC -> C` and `Add -> GCC -> C++`)  
Name: `rM GCC`  
Path: `/usr/local/oecore-x86_64/sysroots/x86_64-oesdk-linux/usr/bin/arm-oe-linux-gnueabi/arm-oe-linux-gnueabi-gcc`
- Debuggers: (with `Add`)  
Name: `rM GDB`  
Path: `/usr/local/oecore-x86_64/sysroots/x86_64-oesdk-linux/usr/bin/arm-oe-linux-gnueabi/arm-oe-linux-gnueabi-gdb`
- Kits:  
 ![qt-wsl-settings-1](/assets/img/2021/01/qt-wsl-settings-1.png)
<!--kg-card-end: markdown-->

Now add your device directly:

`Devices -> Add -> Generic Linux Device`

- IP address: either the IP your device has in WiFi or `10.11.99.1` when connected via USB.
- Username: root

In case you do not have a private key file yet, go to WSL, type `ssh-keygen` select your home dir as location and maybe a custom name e.g. remarkable. Now copy the key to your device with `ssh-copy-id -i remarkable root@[device-ip]`.

Add your private key file (`~/remarkable`) and finish. There might be an error that `rsync` can not be found but as long as the test, in general, completes everything is fine. (we don't need rsync for that) Now go back to `Kits` and select the device you just created on the `Device`.

Now when you type some code you may get some errors about `variable has incomplete type`: This is because it actually uses clang for this. Disable that by going to `Help -> About Plugins -> ClangCodeModel` and removing the check. Then restart qtcreator.

Uncheck `Enable QML` in `Projects -> Build & Run -> rM -> Run -> Debugger Settings`.

Now you can get started :)

<!--kg-card-begin: markdown-->

**Sources**  
[https://remarkablewiki.com/tech/ssh](https://remarkablewiki.com/tech/ssh)  
[https://remarkablewiki.com/devel/qt\_creator](https://remarkablewiki.com/devel/qt_creator)  
[https://remarkable.engineering/deploy/sdk/](https://remarkable.engineering/deploy/sdk/)

<!--kg-card-end: markdown-->