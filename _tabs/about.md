---
icon: fas fa-info-circle
order: 4
title: About
---
<details>
<summary>Max Senpai</summary>

<div markdown="1">
_Max Senpai, real name Maximilian Maerkl, was born in Taipei, Taiwan(R.O.C) and raised in various cities in Austria and Germany. He is fluent in English, German, Spanish, and Mandarin because of his family background. He has been traveling a lot between Europe and Asia and worked as a fundraiser, waiter, bartender, amateur film producer, and_ Emergency Medical Technician (EMT)_. He can be described as a tech enthusiast, travel addict, adrenaline junkie, and humanitarian._

* * *

> _On senpai.club he is starting his debut as a blog author._

* * *
<figure class="kg-card kg-image-card kg-card-hascaption"><img src="/assets/img/2019/12/IMG_4463_3-2.jpg" class="kg-image" alt loading="lazy"><figcaption>Max somewhere on a volcano in Bali</figcaption></figure>

## Socials:

WWW: [https://maxmaerkl.myportfolio.com/](https://maxmaerkl.myportfolio.com/)  
IG: [https://www.instagram.com/max.likes.rice/](https://www.instagram.com/max.likes.rice/)  
FB: [https://www.facebook.com/max.likes.rice/](https://www.facebook.com/max.likes.rice/)  
BEHANCE: [https://www.behance.net/RiceRiot](https://www.behance.net/RiceRiot)  
TELEGRAM: [https://t.me/RiceRiot](https://t.me/RiceRiot)/  
TWITCH: [https://www.twitch.tv/riceriot](https://www.twitch.tv/riceriot)/  
STEAM: [https://steamcommunity.com/id/RiceRiot](https://steamcommunity.com/id/RiceRiot)

</div>
</details>

<details>
<summary>Eric Senpai</summary>
<div markdown="1">

*hey, my name is Eric Trenkel, I was born in Germany and grew up partly in Austria. I am a tech enthusiast and currently studying computer science at the University of Applied Sciences Aachen.*

My Home Lab and the Senpai.Club infrastructure:

<figure class="kg-card kg-gallery-card kg-width-wide"><div class="kg-gallery-container"><div class="kg-gallery-row">
<div class="kg-gallery-image"><img src="/assets/img/2021/03/server_front.jpg" width="640" height="853" loading="lazy" alt srcset="/assets/img/size/w600/2021/03/server_front.jpg 600w,/assets/img/2021/03/server_front.jpg 640w"></div>
<div class="kg-gallery-image"><img src="/assets/img/2021/03/server_back.jpg" width="640" height="853" loading="lazy" alt srcset="/assets/img/size/w600/2021/03/server_back.jpg 600w,/assets/img/2021/03/server_back.jpg 640w"></div>
</div></div></figure>

As for how Senpai.Club works:

~~We are using the CMS Ghost for managing all posts, data and SEO. In front of that a static page hosted with GitLab.

The server itself is a kubernetes cluster with an nginx reverse proxy in front of it that handles the certificate and some other stuff for the Docker container where the CMS runs on. As you are basically opening a static site every time you visit us it needs to be updated regularly.

This is done automatically. Or rather with a CI/CD job: When a post is updated or released the site calls an API endpoint which then fetches all sites from the server and saves them to the GitLab runner. After that the runner runs over the pages and optimizes and edits a few sections. For one all the links are updated so that they really say "senpai.club". It then changes back some API endpoints which are needed for the newsletter signup and some other dynamic functions.

This is basically done twice a day + on every post update. Twice a day because the script for updating the COVID-19 WHO Feed crawls the WHO site twice a day.~~

*You should definitely check out my website erictrenkel.com ;)*

## Socials:
  
https://github.com/bostrot
https://erictrenkel.com

</div>
</details>
