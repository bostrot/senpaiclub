---
layout: post
title: Exclude files and filetypes on OneDrive
date: '2021-02-16 22:15:50'
tags:
- onedrive
- cloud
- sync
- files
---

As OneDrive has no easy to access feature to exclude specific files or folders from being uploaded here is a little guide on how to do it with the group policy editor.

As a developer using OneDrive to backup your PC works but if you have (by accident?) a cache/debug folder or some other folder in your backup that has a lot of different (maybe even very small files) files, you may have already experienced the limits of OneDrive: Uploading a lot of files is simply put Very slow. E.g for the NodeJS devs: A node\_modules folder for even small projects can already contain over 10k files. In my case that wrecked my whole OneDrive installation and it took days until all my stuff was backed up to the cloud.

<!--kg-card-end: markdown-->

**Use OneDrive Insider preview**

<!--kg-card-begin: markdown-->

First make sure that you are using the OneDrive insider preview version as earlier version may not have this feature yet. For that open OneDrive Settings -\> About -\> select `Get OneDrive Insider preview updates before release`

<!--kg-card-end: markdown-->

**Copy template files**

<!--kg-card-begin: markdown-->

Now go to %LOCALAPPDATA%\Microsoft\OneDrive{OneDriveVersion}\adm and copy the OneDrive.adml (language file) to C:\Windows\PolicyDefinitions\en-US and the OneDrive.admx to C:\Windows\PolicyDefinitions.

<!--kg-card-end: markdown-->

**Use Local Group Policy Editor**

<!--kg-card-begin: markdown-->

Open the local group policy editor (e.g. with WIN+R and gpedit.msc) and select ?`Computer Configuration -> Administrative Templates -> All Settings`. Now find `Exclude specific kinds of files from being uploaded`.

<!--kg-card-end: markdown--><figure class="kg-card kg-image-card"><img src="/assets/img/2021/02/image.png" class="kg-image" alt loading="lazy" width="1527" height="976" srcset="/assets/img/size/w600/2021/02/image.png 600w,/assets/img/size/w1000/2021/02/image.png 1000w,/assets/img/2021/02/image.png 1527w" sizes="(min-width: 720px) 720px"></figure><!--kg-card-begin: markdown-->

Now on `Keywords: Show...` you can add keywords for files to exclude from being uploaded. Just type the name of the file you want to ignore or like in the description use `*` as a wildcard to select multiple filetypes or names.

**Update 2021/2/18**

While using I found two kinda big limitations of this:

1. This does not seem to work with folders yet.
2. Only new files are being ignored. Old, already uploaded files stay as they are.

When a file is ignored it has a different kind of icon instead of the OneDrive Sync logo.

<!--kg-card-end: markdown-->