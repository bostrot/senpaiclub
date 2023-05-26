---
layout: post
title: Fast CD with Dokku on Docker
date: 2021-04-14T09:00:00.000Z
tags:
- dokku
- docker
- guide
- cd
- home-server
---

This will be my little journey on how I set up my CD with dokku, nginx as a reverse proxy, as a cache (in case of downtime) and SSL with wildcard domains.

I actually had never heard of Dokku before a few days ago when a client asked me about ways to deliver his API as a test run without setting up big k8s clusters. The first thing that came up my mind was Heroku. But there were some compelling reasons against using it so I did a quick search and found Dokku really quick.

## What is Dokku?

The GitHub repo describes it as following:

> Docker powered mini-Heroku. The smallest PaaS implementation you've ever seen.

Basically it works for the most part just as Heroku does but on your own server. So most people would use it like this: once you have a project that you want to quickly share e.g. an API or some other app you can just push it via git to your dokku instance and like Heroku it does the rest. It automatically sets it up to be running on your domain.

As it is being developed as an open source project for years now it has build up quite a community and therefore a lot of plugins and modifications which lets you manage your instance very easily for the basic stuff.

## How to get started?

It isn't very difficult if you know what to do. Although I had some troubles setting it up first as I wanted to use docker and I find the Dokku docs not that good documented when you have no idea whatsoever when you start.

I am familiar with Docker so here is what to do when using it:

<!--kg-card-begin: markdown-->

**1. Run the container. Replace the hostname with the hostname you want to use.**

    docker container run \
      --env DOKKU_HOSTNAME=dokku.docker \
      --name dokku \
      --publish 3022:22 \
      --publish 8080:80 \
      --publish 8443:443 \
      --volume /var/lib/dokku:/mnt/dokku \
      --volume /var/run/docker.sock:/var/run/docker.sock \
      dokku/dokku:0.24.5

**2. Add this to `~/.ssh/config` so that you can access it over `dokku.docker`.**

    Host dokku.docker
      HostName 127.0.0.1
      Port 3022

**3. Generate your SSH key. Make sure to add the private key file to `~/.ssh/id_rsa`.**

    ssh-keygen -b 2048

**4. Exec into the docker machine to add an SSH key.**

    docker exec -it dokku bash
    vi /key.pub # paste your pub key and save with ESC -> 'wq!'
    dokku ssh-keys:add admin /key.pub
    dokku ssh-keys:list # confirm that this has an output
    exit

**6. Add docker Dokku as a command. (Works with debian/ubuntu and bash. Not sure about others)**

    nano ~/.bash_aliases
    alias dokku="docker exec -it dokku dokku" # add this line then re-login with your linux account

**7. Now we can try to deploy our first app.**

    git clone https://github.com/heroku/ruby-getting-started
    dokku apps:create ruby-getting-started
    
    cd ruby-getting-started
    git remote add dokku dokku@dokku.docker:ruby-getting-started
    git push dokku

Most people would be done now. Maybe the next step in case you want to use a reverse proxy to access the docker container from outside and don't want to directly expose it.

By now you can basically push any git project to dokku and it will work like Heroku. Check whether it knows how to start everything. (It mostly does) Then do the rest by itself.

It also works with subtree repos:

    git subtree push --prefix subfolder dokku master

** ~~_Rest is optional_~~ **

Depending on your config you might already be done now. In my case I wasn't as I access my server over 2 reverse proxies. If you have NGINX you will probably fine by adding a file to `/etc/nginx/sites-enabled` with something like this:

    server {
        listen 443 ssl;
    
        server_name *.app.yoursite.com;
    
        ssl_certificate /path/to/your/certificate;
        ssl_certificate_key /path/to/your/certificate_key;
    
        location / {
            proxy_pass http://127.0.0.1:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $remote_addr;
        }
    
    }

Of course with this you would need a TLS/SSL certificate for a wildcard domain. I did that with [certbot](https://certbot.eff.org/instructions):

    sudo certbot certonly --agree-tos --email your@email.com --manual --preferred-challenges=dns -d *.app.yoursite.com --server https://acme-v02.api.letsencrypt.org/directory --manual

This asks you to confirm after you added a TXT record to your domain and gives you the paths of the certificate & keyfile. Use those to update the NGINX file.

**8. Done. Access the test app at [https://ruby-getting-started.app.yoursite.com](https://ruby-getting-started.app.yoursite.com).**

Though am I really done? ... No. I had to make it more complicated. So as my internet is not very stable and I have some APIs that are running for static pages hosted outside of my network I decided to put another reverse proxy in front of it. This time with caching when my server is offline.

** ~~_Do you really need this?_~~ **

**9. Rent a server outside with a good internet connection. AWS in my case. Set everything up including NGINX. Now for the config:**

    # *.app.yoursite.com domains with caching
    proxy_cache_path /var/lib/nginx/tmp/proxy_cache levels=1:2 keys_zone=STATIC:10m max_size=4g inactive=5d use_temp_path=off;
    
    # reverse proxy to apps
    server {
        listen 443;
    
        server_name *.app.yoursite.com;
    
        ssl_certificate /etc/letsencrypt/live/app.yoursite.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app.yoursite.com/privkey.pem;
    
        location / {
            proxy_cache STATIC;
            proxy_cache_valid 200 1d;
            proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
            proxy_cache_methods GET HEAD POST;
            proxy_pass https://my-home-network-public-address;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $remote_addr;
        }
    
    }

For this to work I set up another SSL/TLS certificate with certbot but on the new server so that it would auto-renew with Let's encrypt.

**10. DONE. This time for real. Yay!**

Here a short overview of how a request would work. When a (HTTPS) wildcard domain like yourapp.app.yoursite.com is accessed it goes to the AWS server which has a higher uptime than my network. The server basically connects to the server on our network which then again connects to docker and finally gets the wanted app/site/api. It then forwards the results to the user through all those steps.

We are basically caching every request up to 5 days with the max size of 4GB. Everything older in this cache than 10 minutes will not be used. Then when the day comes and our network is down it uses the 5d/4gb cache and tries to deliver at least most of the common requests.

<!--kg-card-end: markdown-->

In the end it turned out to be quite a journey I guess. I have no idea if it was worth all the hassle but I am very happy that I can deploy demos and small APIs with domains, SSL and caching already set up with two commands now.

Hope it didn't hurt to much reading about this. :)

