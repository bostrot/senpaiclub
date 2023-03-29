---
layout: post
title: Benchmarking single board computers with Geekbench for ARM
date: '2021-03-16 23:07:32'
tags:
- benchmark
- arm
- geekbench
- raspberry-pi
---

Geekbench released a pre-released version (5.4) of their benchmarking software a short while ago which makes it very easy to benchmark your single board computers and compare them. Of course this might also work with any kind of ARM device.

Right now it works for arm (armv7) and the new RISC-V architecture. It is still a pre-release so it may not work perfectly or show all of your specs or might not even work at all.

If you are using a Raspberry PI (arm architecture) you can download their pre-release [here](https://cdn.geekbench.com/Geekbench-5.4.0-LinuxARMPreview.tar.gz). For RISC-V [this](https://cdn.geekbench.com/Geekbench-5.4.0-LinuxRISCVPreview.tar.gz) is the download link.

Once downloaded extract it (e.g. on linux with tar):

<!--kg-card-begin: markdown-->

    tar xf Geekbench-5.4.0-LinuxARMPreview.tar.gz
    cd Geekbench-5.4.0-LinuxARMPreview.tar.gz
    ./geekbench5

<!--kg-card-end: markdown-->

This will run geekbench on your device, upload the results to their site and gives you the link to access them.

As for my passively-cooled Raspberry Pi 4:

<figure class="kg-card kg-image-card"><img src="/assets/img/2021/03/image.png" class="kg-image" alt loading="lazy" width="1107" height="82" srcset="/assets/img/size/w600/2021/03/image.png 600w,/assets/img/size/w1000/2021/03/image.png 1000w,/assets/img/2021/03/image.png 1107w" sizes="(min-width: 720px) 720px"></figure>

**Sources:**

**Geekbench 5.4** , [https://www.geekbench.com/blog/2021/03/geekbench-54/](https://www.geekbench.com/blog/2021/03/geekbench-54/) (last visited Mar. 17, 2021).

