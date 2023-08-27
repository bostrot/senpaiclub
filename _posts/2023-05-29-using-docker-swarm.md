---
layout: post
title: "Using Docker Swarm Instead of Kubernetes: A Practical Guide"
date: 2023-05-29
author: eric
tags: [docker,swarm,glusterfs,load balancing,cluster,caddy]
categories: [wiki]
---
## Introduction

Welcome to this guide on setting up a cost-effective Docker Swarm cluster on multiple VPS instances that each have just one "physical" drive. This article is aimed at those who want to maximize utility without burning a hole in the wallet. We will take advantage of intrinsic capabilities of DNS records, specifically at the Application Layer of the OSI model, to distribute the load between our nodes. This approach offloads the balancing work to the client, making it an inexpensive yet functional alternative.
### Key Highlights

- **Docker Swarm Setup:** Initialize and join nodes cheaply, ideally suited for VPS with limited resources.
- **Single Physical Drive:** Utilize GlusterFS to create a shared volume across nodes with just one physical drive.
- **DNS Load Balancing:** Leverage the Application Layer's DNS records to handle load distribution, thus shifting the workload to the client-side.
- **Caddy 2 Reverse Proxy:** Use a straightforward Docker Swarm service to manage reverse proxy tasks.
- **Portainer for Management:** Deploy a Docker Swarm service for easier cluster administration.

With these key topics in mind, let's delve into the guide.
## Setup Docker Swarm Cluster

1. **Initialize the Swarm Manager**

    ```bash
    docker swarm init --advertise-addr [MANAGER_IP]
    ```

2. **Join Swarm as Worker Nodes**
   
    ```bash
    docker swarm join --token [SWARM_JOIN_TOKEN] [MANAGER_IP]:2377
    ```

3. **Update Hosts File**
   
    ```bash
    echo "192.168.1.2 manager" >> /etc/hosts
    echo "192.168.1.3 worker1" >> /etc/hosts
    ```

## GlusterFS Shared Volume

1. **Install GlusterFS**
   
    ```bash
    apt update
    apt install -y glusterfs-server
    ```

2. **Create Virtual Drive**
   
    ```bash
    fallocate -l 10G /mnt/virtual_drive.img
    mkfs.ext4 /mnt/virtual_drive.img
    mount -o loop /mnt/virtual_drive.img /mnt/data
    ```

3. **Create Gluster Volume**
   
    ```bash
    gluster volume create data replica 2 manager:/mnt/data worker1:/mnt/data
    gluster volume start data
    ```

## DNS Load Balancing

Add multiple A records pointing to each of your nodes.

```dns
A example.com 192.168.1.2
A example.com 192.168.1.3
```

## Caddy 2 as Reverse Proxy

Create a docker-compose-caddy.yml file:

```yml
version: '3'
services:
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    extra_hosts:
      - "dockerhost:172.17.0.1"
```

Deploy using:

```bash
docker stack deploy -c docker-compose-caddy.yml caddy
```

## Advanced Caddy Configuration Using Caddyfile

Once you've deployed Caddy as your reverse proxy within the Docker Swarm cluster, you'll need to configure it to fit your needs. The Caddyfile is a powerful way to define Caddy's behavior. In this example, we'll set up GitHub OAuth for authentication, DNS-based TLS with Cloudflare, and routing to different services.

Here's an extensive Caddyfile example:

```plaintext
{
  https_port 443
  security {
    oauth identity provider github {env.GITHUB_CLIENT_ID} {env.GITHUB_CLIENT_SECRET}
    authentication portal myportal {
      crypto default token lifetime 3600
      crypto key sign-verify {env.JWT_SHARED_KEY}
      enable identity provider github
    }
    authorization policy mypolicy {
      set auth url https://auth.aachen.dev/oauth2/github
      crypto key verify {env.JWT_SHARED_KEY}
      allow roles authp/admin authp/user
      validate bearer header
      inject headers with claims
    }
  }
}

auth.example.com {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  authenticate with myportal
}

page.example.com {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }  
  reverse_proxy http://172.17.0.1:8000
  authorize with mypolicy
}
```

To implement this Caddyfile into your Docker Swarm, include it as a volume in your Caddy service definition. Your `docker-compose-caddy.yml` would look something like this. Make sure that you build the caddy image with Cloudflare if you will use it for automatic SSL renewal (see [caddy-dns/cloudflare: Caddy module: dns.providers.cloudflare (github.com)](https://github.com/caddy-dns/cloudflare) for details).

```yml
version: '3'
services:
  caddy:
    image: caddy-with-cloudflare:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    environment:
      - CLOUDFLARE_API_TOKEN=TOKEN
      - GITHUB_CLIENT_ID=ID
      - GITHUB_CLIENT_SECRET=SECRET
      - JWT_SHARED_KEY=SOME_KEY # generate using e.g. openssl rand -hex 16
    extra_hosts:
      - "dockerhost:172.17.0.1"
```

Make sure you create your `Caddyfile` in the same directory as your `docker-compose-caddy.yml` or specify the full path in the volume mapping. Make sure you add environment variables for `JWT_SHARED_KEY` and `CLOUDFLARE_API_TOKEN`.

## Deploy Portainer

Create a docker-compose-portainer.yml file:

```yml
version: '3'
services:
  portainer:
    image: portainer/portainer-ce
    ports:
      - "9000:9000"
```

Deploy using:

```bash
docker stack deploy -c docker-compose-portainer.yml portainer
```

## Conclusion and Considerations

The objective of this article was to provide a comprehensive guide on establishing a Docker Swarm cluster utilizing economical VPS solutions with single physical drives. Docker Swarm was chosen for its ease of deployment and inherent load-balancing capabilities. The latter was particularly leveraged through Caddy 2, which we configured to automatically distribute incoming requests to appropriate service nodes via the special Docker host IP, 172.17.0.1.

Using DNS A-records for load balancing was a cost-effective, albeit rudimentary, method. While it offloads the balancing task to the client, it remains a productive solution for less resource-intensive deployments. 

For storage solutions, GlusterFS was employed to offer a shared volume across the nodes. This is an economical yet robust choice for facilitating data sharing and persistence in the network.

Moreover, the integration of Caddy 2 provided an extensible platform for reverse proxying and furnished enhanced security measures through GitHub OAuth. This is particularly crucial for restricting access to authorized individuals, thereby bolstering the overall security posture of the cluster.

Additionally, Portainer was introduced as a robust yet user-friendly option for managing Docker configurations. It offers a convenient graphical interface that augments the accessibility of cluster management tasks, especially for those who may not be comfortable with command-line interfaces.

In summary, the combination of Docker Swarm, Caddy 2, GlusterFS, and Portainer offers a robust, secure, and cost-effective solution for container orchestration. Although the system is optimal for smaller to medium-scale deployments, the architecture provides substantial flexibility for future scaling and can be augmented with more advanced solutions.

Happy containerizing!
