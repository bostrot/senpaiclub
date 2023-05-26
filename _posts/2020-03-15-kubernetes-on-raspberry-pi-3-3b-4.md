---
layout: post
title: A quick guide for Kubernetes on a Raspberry Pi (3, 3B, 4) cluster
date: 2020-03-15T09:00:00.000Z
tags:
- raspberry-pi
- kubernetes
- container
- home-server
- cluster
- guide
---

While there are many guides on creating a cluster with Kubernetes there are less on how to create one with Raspberry Pi's (arm architecture) and even less for novices that explain in an easy way what to keep in mind when doing this.

When I started with this project I knew next to nothing about Kubernetes and what lies behind it. In this article, I will not go deeper into the material than setting it up correctly and deploying an example container (GitLab runner) from Docker hub.

### Requirements

- Raspberry Pi (at least 2GB RAM is recommended for the master so go for RPi 4)

### A quick overview of Kubernetes and the used programs

- kubeadm - master command for the cluster
- kubelet - this runs the containers
- kubectl - utility to control the cluster
- flannel - overlay network for network configuration

## Installing kubeadm, kubelet and kubectl

    apt-get update && apt-get install -y apt-transport-https curl
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
    cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
    deb https://apt.kubernetes.io/ kubernetes-xenial main
    EOF
    apt-get update
    apt-get install -y kubelet kubeadm kubectl
    apt-mark hold kubelet kubeadm kubectl
    

## Initialize kubeadm (on master node only)

    kubeadm init --apiserver-cert-extra-sans=<local ip of master node> --service-cidr 172.16.0.0/16 --pod-network-cidr=10.244.0.0/16
    

After initialization it will give you a command to join the cluster which shall be executed on all slave nodes. It will look something like this:

    kubeadm join 192.168.0.66:6443 --token kgr932f.g3j3i453ji0t34 \
    --discovery-token-ca-cert-hash sha256:f9i3fh39hf04h93iuh43g4jih3g4oiho3g4
    

## Copy configuration

    mkdir -p $HOME/.kube
    sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config
    

## Install Flannel

    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/62e44c867a2846fefb68bd5f178daf4da3095ccb/Documentation/kube-flannel.yml

<!--kg-card-begin: markdown-->
## Example container - gitlab runner

    apiVersion: extensions/v1beta1
    kind: Deployment
    metadata:
    name: gitlab-runner-arm
    spec:
    replicas: 4
    template:
        metadata:
        labels:
            arch: arm
        spec:
        containers:
            - image: bostrot/gitlab-runner:latest
            name: gitlab-runner-arm
    # volumeMounts:
    # - mountPath: /etc/gitlab-runner
    # name: gitlab-etc
    # - mountPath: /home/gitlab-runner
    # name: gitlab-home
            env:
                - name: registrationToken
                value: <token>
                - name: description
                value: <cluster name>
    # volumes:
    # - name: gitlab-etc
    # emptyDir: {}
    # - name: gitlab-home
    # emptyDir: {}
    

<!--kg-card-end: markdown--><!--kg-card-begin: markdown-->

Now you can create the container with `kubectl apply -f runner.yml`. You can shut it down with `kubectl delete -f runner.yml`.

## Sources

Installing kubeadm, kubelet and kubectl - [https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-kubeadm-kubelet-and-kubectl](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-kubeadm-kubelet-and-kubectl) (last visited Mar. 15, 2020)  
The Kubernetes network model - [https://kubernetes.io/docs/concepts/cluster-administration/networking/](https://kubernetes.io/docs/concepts/cluster-administration/networking/) (last visited Mar. 15, 2020)

<!--kg-card-end: markdown-->