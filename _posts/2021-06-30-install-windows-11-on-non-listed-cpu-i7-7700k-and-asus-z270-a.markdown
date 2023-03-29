---
layout: post
title: Install Windows 11 on non-compatible CPU (i7-7700k) and ASUS Z270-A
date: '2021-06-30 11:26:25'
tags:
- windows-11
- i7-7700k
- z270-a
- insider-preview
- update
---

After you heard about Windows 11 new compatibility list you may be bummed out as a lot older (even flagship-) CPUs are not officially supported by the new update. While that may change and Microsoft could add some CPUs to the list here is a quick guide on how some of you can still install the Windows 11 Preview Build on your PC.

I tried it with the i7-7700k and the ASUS Z270-A motherboard. This one has PTT support which is an inbuild TPM module required by Windows 11. As far as I know, it only supports TPM 1.2 so if Microsoft decides to bump to TPM 2.0 before launch then there is a definite no for working with that motherboard.  
  
Anyways, here is how to set your motherboard up correctly so you can at least receive some dev channel updates for the Windows 11 Insider Preview.

Set those settings in your Z270-A BIOS: (probably similar ones if your mainboard supports PTT. Check that on the manufacturers page)

- Advanced/PCH-FW -\> TPM Device Selection -\> PTT to PTT
- Advanced/PCH-FW -\> TPM Device Selection -\> PTP aware OS to PTP Aware.
- Boot/Secure Boot -\> OS Type to Windows UEFI
- Boot/CSM -\> Launch CSM to Disabled (you probably can not start your Linux OS after setting this to disabled)

Restart and that should be it. Open Windows Settings -\> Updates -\> Windows-Insider-Preview (you might have to enable extended diagnostics). Now you will probably still read something like that your PC doesn't fulfill Windows 11 minimum requirements but you should be able to click on the Start button for the Insider Preview and select the Dev channel thus installing the Windows 11 Insider Preview anyways.

Although following screenshot is in German you will probably get the idea:

<figure class="kg-card kg-image-card kg-card-hascaption"><img src="/assets/imgs/2021/06/image.png" class="kg-image" alt loading="lazy" width="1200" height="928" srcset="/assets/imgs/size/w600/2021/06/image.png 600w,/assets/imgs/size/w1000/2021/06/image.png 1000w,/assets/imgs/2021/06/image.png 1200w" sizes="(min-width: 720px) 720px"><figcaption>Choose the Dev Channel to receive the insider preview.</figcaption></figure><figure class="kg-card kg-image-card kg-card-hascaption"><img src="/assets/imgs/2021/07/image-3.png" class="kg-image" alt loading="lazy" width="842" height="856" srcset="/assets/imgs/size/w600/2021/07/image-3.png 600w,/assets/imgs/2021/07/image-3.png 842w" sizes="(min-width: 720px) 720px"><figcaption>System Info after updating to Windows 11</figcaption></figure>

Have fun. Updates following...

**Update 10/24/2021**

[AMD announced](https://www.amd.com/en/support/kb/faq/pa-400) that there might be a huge (10-15%) performance loss when gaming - with an AMD CPU - on Windows 11. As of October 21, there is a patch available though, which should fix those issues.

Sources:

<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://docs.microsoft.com/en-us/windows-hardware/design/minimum/minimum-hardware-requirements-overview"><div class="kg-bookmark-content">
<div class="kg-bookmark-title">Minimum hardware requirements</div>
<div class="kg-bookmark-description">This topic defines the minimum hardware requirements for Windows 10 and all types of devices or computers designed for this release.</div>
<div class="kg-bookmark-metadata">
<span class="kg-bookmark-author">Microsoft Docs</span><span class="kg-bookmark-publisher">windows-driver-content</span>
</div>
</div>
<div class="kg-bookmark-thumbnail"><img src="https://docs.microsoft.com/en-us/media/logos/logo-ms-social.png" alt=""></div></a></figure>