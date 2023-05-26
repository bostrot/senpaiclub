---
layout: post
title: Share files without the Resilio client
date: 2023-04-02T22:39:51.150Z
tags:
  - resilio
  - sync
  - windows
  - sharing
---
![Webserver for fiels](/assets/uploads/screenshot-2023-04-03-010211.png)

Sharing files with Resilio is a breeze, especially if the Resilio client is installed. But what happens when you want to share files with someone who doesn't have a client? Luckily, there is a solution that allows you to do just that.
The first step is to create a new folder in Resilio. This folder mustn't be encrypted, as that would make it difficult for people without the client to access the files. Once the folder is created, you need to install Resilio on an online server. This server will host your files, allowing people to access them even if their devices are turned off.
After installing Resilio on the server, set up the folder you created and note the path it uses. This path will be important later on when we start setting up the sharing process.

Now that the server is set up, we can start sharing our files with people who don't have the Resilio client. To do this, we'll use a GitHub project that creates a Docker stack that starts a webserver. This web server will then share all the files in the folder we created earlier.

If you're unfamiliar with Docker, it's a platform that allows you to efficiently create, deploy, and run applications in containers. These containers are lightweight, portable, and can run on any machine with Docker installed.
Once Docker is installed on your server, download the files and head to the GitHub project mentioned earlier. Follow the instructions in the README to set up the Docker stack, providing the path to the folder you created earlier.

With the Docker stack up and running, people without the Resilio client can now access your files through a web browser. All they need is the URL for the server, and they can start downloading the files.
But what if you don't have access to a server that is always online? In that case, you can still share your files locally using Docker Desktop. However, you'll need to keep port forwarding in mind, which can be tricky if you need to familiarize yourself with networking.

To make things easier, you can use a tool like localtunnel or ngrok to create a public URL that people can use to access your files. These tools expose a local port to the internet, allowing people to access your files through a web browser.

![Resilio screenshot](/assets/uploads/screenshot-2023-04-03-010743.png)

In conclusion, sharing files with people who don't have the Resilio client is possible thanks to Docker and a little setup. By following the steps outlined in this article, you can easily share your files with anyone, anywhere, regardless of whether they have the Resilio client or not.

### Resources

- **bostrot/RustyFS**, [https://github.com/bostrot/RustyFS](https://github.com/bostrot/RustyFS) (last visited May 26, 2023).
