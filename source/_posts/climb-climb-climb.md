---
title: Climb Climb Climb
date: 2019-10-29 23:30:19
tags:
author: muxin
---

This guide is a step by step turotial for building a `ladder`. Hope this guide helpful to you.

![Climb the wall](/blog/2019/10/29/climb-climb-climb/climb_the_wall.png)

<!-- more -->

## Prerequisite

<div class="tip">
Before building your own ladder, the following prerequisites needed.

1. A foreign `vps server` which can visit google.com is enough.
2. `Docker` has been installed on the vps os.

</div>

## [Server Side] How to build a vpn server

### IPsec VPN Server on Docker

Docker image to run an IPsec VPN server, with both IPsec/L2TP and Cisco IPsec.

1. Pull the latest docker image

   ```bash
   $ sudo docker pull hwdsl2/ipsec-vpn-server
   ```

2. hwdsl2/ipsec-vpn-server **instructions**

   * Environment variables

     This Docker image uses the following variables, that can be declared in an env file (example):

     ```env
     VPN_IPSEC_PSK=your_ipsec_pre_shared_key
     VPN_USER=your_vpn_username
     VPN_PASSWORD=your_vpn_password
     ```

   * Start the IPsec VPN server

     Create a new Docker container from this image (replace ./vpn.env with your own env file):

     ```bash
     docker run \
         --name ipsec-vpn-server \
         --env-file ./vpn.env \
         --restart=always \
         -p 500:500/udp \
         -p 4500:4500/udp \
         -d --privileged \
         hwdsl2/ipsec-vpn-server
     ```

   * Retrieve VPN login details

     If you did not specify an env file in the docker run command above, VPN_USER will default to vpnuser and both VPN_IPSEC_PSK and VPN_PASSWORD will be randomly generated. To retrieve them, view the container logs:

     ```bash
     $ sudo docker logs ipsec-vpn-server
     ```

     Search for these lines in the output:

     ```log
     Connect to your new VPN with these details:

     Server IP: your_vpn_server_ip
     IPsec PSK: your_ipsec_pre_shared_key
     Username: your_vpn_username
     Password: your_vpn_password
     ```

   * Check server status

     To check the status of your IPsec VPN server, you can pass ipsec status to your container like this:

     ```bash
     $ sudo docker exec -it ipsec-vpn-server ipsec status
     ```

     Or display current established VPN connections:

     ```bash
     $ sudo docker exec -it ipsec-vpn-server ipsec whack --trafficstatus
     ```

   * Update Docker image

     To update your Docker image and container, follow these steps:

     ```bash
     $ sudo docker pull hwdsl2/ipsec-vpn-server
     ```

   [More Details...](https://github.com/hwdsl2/docker-ipsec-vpn-server)
3. Sample

   ![img: ipsec-vpn-server sample](ipsec-vpn-server-sample.png)

## [Client Side] How to connect to the vpn server

### On macOS

All things are going to be easy on macOS, because you don't need to prepare anything, like installing softwares, etc. Let's enjoy the tour.

   1. Turn on your mac and open network preference. Click the `'+'` button on the lower left corner of network manager window. Select 'VPN' interface, 'L2TP over IPSec' vpn type and name your vpn connection.
   ![img: vpn creation](VPN-creation.png)

   1. VPN server configuration, fill in the blank of **vpn server address** and your **acount name**.
   ![img: server and acount configuration](Server-config.png)

   1. Authentication info configuration, fill in your vpn server's **share secret** and account's **password**.
   ![img: authentication info configuration](Authentication-config.png)

   1. Ensure all traffic over this vpn connection.
   ![img: Ensure all traffic over vpn connection](Enable-all-traffic-over--vpn-connection.png)

### On manjaro Linux

<div class="tip warn">
Environment:

* OS: <a href="https://osdn.net/dl/manjaro/manjaro-gnome-18.1.0-stable-minimal-x86_64.iso">manjaro-gnome-18.1.0-stable-minimal-x86_64</a>
</div>

<div class="tip">
Ensure the <code>base-devel</code> package group is installed in full, you can use this command to install.
<a href="https://wiki.archlinux.org/index.php/Arch_User_Repository"> More details</a>.
```bash
$ pacman -S --needed base-devel
```
</div>

```bash
$ mkdir -p ~/workspace/arch/ && cd ~/workspace/arch/
$ git clone https://aur.archlinux.org/networkmanager-l2tp.git && cd networkmanager-l2tp
$ makepkg -sri # arch command to install networkmanager-l2tp
$ sudo pacman -S strongswan # to solve that the IPsec config button is shadow
```

## Reference

1. <https://aur.archlinux.org/packages/networkmanager-l2tp/>
2. **manjaro l2tp vpn proposal**, <https://forum.manjaro.org/t/solved-using-l2tp-for-vpn/35133>
   > ![img: to solve that the IPsec config button is shadow](solve_ipsec_button_is_shadow.png)
3. <https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients.md>
4. <https://wiki.archlinux.org/index.php/Arch_User_Repository>
5. <https://github.com/hwdsl2/docker-ipsec-vpn-server>
