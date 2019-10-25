---
title: Deploy Kubernetes on Ubuntu 18.04 LTS by kubeadm
date: 2019-10-16 17:06:19
tags:
author: muxin
---

Here is the abstract of the post.

<!-- more -->

<div class="tip warn">
The installation is based on <a href="https://ubuntu.com/download/server/thank-you?country=CN&version=18.04.3&architecture=amd64">ubuntu 18.04 LTS</a>.
</div>

## Prerequisite

1. Install `docker`
   ```bash
   $ sudo apt install docker.io -y
   $ sudo systemctl enable docker
   ```
   **Ref:** Another official installation [docs](https://docs.docker.com/install/linux/docker-ce/ubuntu/).
2. Install `kubeadm`, `kubectl` and `kubelet`
   ```bash
   $ sudo cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
   # kubeadm及kubernetes组件安装源
   deb https://mirrors.aliyun.com/kubernetes/apt kubernetes-xenial main
   EOF
   $ sudo apt-get update
   $ sudo apt-get install -y kubelet kubeadm kubectl
   $ sudo apt-mark hold kubelet kubeadm kubectl
   ```
3. Disable swap memory (if running) on both the nodes
   ```bash
   $ sudo swapoff -a
   ```
4. Give unique hostnames to each node
   * Run the command on the **master** node:
   ```bash
   $ sudo hostnamectl set-hostname master-node
   ```
   * Run the command on the **worker** node:
   ```bash
   $ sudo hostnamectl set-hostname worker-node
   ```
5. Configure [myself's docker image registry](https://www.slicloud.com:8900/)
   Cause my site's certificate is signed by unknown authority. I need to make the machines trust this certificate. Please read the docker's [reference](https://docs.docker.com/engine/security/certificates/) before pull or push any images from the harbor without authority.

   The following illustrates a configuration with custom certificates:
   ```
   /etc/docker/certs.d/        <-- Certificate directory
   └── www.slicloud.com:8900/  <-- Hostname:port
      ├── client.cert          <-- Client certificate
      ├── client.key           <-- Client key
      └── ca.crt               <-- Certificate authority that signed
                                   the registry certificate
   ```
   ```bash
   $ sudo mkdir -p /etc/docker/certs.d/www.slicloud.com:8900
   $ cd /etc/docker/certs.d/www.slicloud.com:8900/
   $ sudo openssl genrsa -out client.key 4096
   $ sudo openssl req -new -x509 -text -key client.key -out client.cert
   $ sudo cat <<EOF >/etc/docker/certs.d/www.slicloud.com:8900/ca.crt
-----BEGIN CERTIFICATE-----
MIIF6DCCA9CgAwIBAgIJAOjOU71I7MvuMA0GCSqGSIb3DQEBDQUAMG8xCzAJBgNV
BAYTAlRXMQ8wDQYDVQQIDAZUYWlwZWkxDzANBgNVBAcMBlRhaXBlaTEQMA4GA1UE
CgwHZXhhbXBsZTERMA8GA1UECwwIUGVyc29uYWwxGTAXBgNVBAMMEHd3dy5zbGlj
bG91ZC5jb20wHhcNMTkxMDE2MDc0MjU5WhcNMjkxMDEzMDc0MjU5WjBvMQswCQYD
VQQGEwJUVzEPMA0GA1UECAwGVGFpcGVpMQ8wDQYDVQQHDAZUYWlwZWkxEDAOBgNV
BAoMB2V4YW1wbGUxETAPBgNVBAsMCFBlcnNvbmFsMRkwFwYDVQQDDBB3d3cuc2xp
Y2xvdWQuY29tMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA1T/Pa5/7
qLMN0ITqTMbQpW9N59oRWcQLZtcQAwAOBrBvo3FqEPIQANJIBlIk3Xj/igItEsTz
Ki5IJnsga1VP9c6QQo3vWmG2A7QTQm1s8qguAsVHcDTZk5prN65ocXAxvfFjvaEj
vxtPF/OTxI6gTwIznV86ifpypYfd8FFyk2/hJ1OmTp8Co7VpbiIAQph+T2ntzwmW
8aCbyYnws5enchoiGCNv6HVKgxs4T6xaInD49dULugVI/XzvEoDkPNvPRPA5LUof
IfjH5MP4WwzCRXdKssCGAT9htsWY5gIvzxKbM0x4dA79S5AFjpSvzqsltR2pG3gK
58Vw+GCIcQt/2LQkO2saLL2yJe0d0nz+NUOFZS7VW1z6QzMxUUMUq3aGEg1D753c
aDI7WFoTp45q+mY6ji2TnTJRW/QnlfAOo/28NIQ8Kv/BsGc1CWMNRPYkMlQjA/WU
4Adig6sxmesoe0iFrSLhNqaWHO5HLB95jf1j0ZJe/HiVkVTjy9C5fLe9AXK0fm4H
L4iKYANkLcWhCRUUCtUO7hKjScSLR+qK8Xcg4ciClxF6hP1y/zXOCDna4wjNjNxS
omENkicg6Gsx9JCAafh80+fHzR+xJICB731pRlLMfpn7lxuE4GH30yLwvhIxS3zc
4PYeXiCC/WeFtTaoDgrEjT1Ol7wVz8Wdx0UCAwEAAaOBhjCBgzAfBgNVHSMEGDAW
gBSLRGPBwjHXVxWp6ZblMFkHx4Zt0zAJBgNVHRMEAjAAMAsGA1UdDwQEAwIE8DAT
BgNVHSUEDDAKBggrBgEFBQcDATAzBgNVHREELDAqghB3d3cuc2xpY2xvdWQuY29t
gghzbGljbG91ZIIMc2xpY2xvdWQuY29tMA0GCSqGSIb3DQEBDQUAA4ICAQAhm4qD
oEvmrscVusNTwYC8yEpybUK2bJqYH2ODiS1r12PCVz2v02aC+F7sAu92ytpVGtOJ
N5sP1BXPfzkJPPQdwN2mEkDNlPH3akc8dzdfxodhRDGYSs95Yyg9D9HU/WKYpDhX
XCZNaIkFxft6tHdYlRdcexfN9ttd0n3PoVqdhcnIi2FXtMJwd7d/cwscmlaK9hne
X26/bQC8Rmn2YVw4B9EQ1jvB1K1VprwGKdMczM2yqrBgThYCfNdD8xa8PExpDCLg
lQB3I9w4bG2pWkr0d0l5C2oINy3JqT8Bf31EXQALcY18tFfDWLazSwYoPjKioFSA
5ACe0ZxD7V25Tlct5iHVoAMNbOJ8Mer5W0H9XkMXA8ojiMosEYT6nQ4Z4UPg+hnX
e2tAJS7xGpvUPR0rxbaUfA3uKTacFkEGCBM8di4VBCrhajy66ujKXHImdmPBRm0u
BxebOQ0cbIILdyu5f8vjQaz2KWQiBlMHIIlqoxaXwqjnq+9vDCK7GcTZ+0QNBWLA
3gvu+n4V28k/HFKxWeC6i1sN4KynstgF791QX232qrdZkkajtf3hrcVRww4r2qqq
JBgM/hcPrFfK6Eb4wNXi8QzdcEGNQCRRKTqNY3PnPW034G9wDC0fIuSSv5R8GLJw
emHljWn5zEhABJF3j4f2iLEhQfKCHEtjx9Egaw==
-----END CERTIFICATE-----
EOF
   ```

## Kubernetes Installation

```bash
$ sudo kubeadm init --image-repository=www.slicloud.com:8900/kubernetes --pod-network-cidr=10.244.0.0/16
```

```bash
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

## Verify

```bash
$ sudo kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

## References

1. [Install and Deploy Kubernetes on Ubuntu 18.04 LTS](https://vitux.com/install-and-deploy-kubernetes-on-ubuntu/)
2. [用kubeadm在Ubuntu上快速构建Kubernetes测试集群](https://jimmysong.io/kubernetes-handbook/practice/install-kubernetes-on-ubuntu-server-16.04-with-kubeadm.html)
3. [Installing kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)
4. [Creating a single control-plane cluster with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
5. [Myself's Harbor](https://www.slicloud.com:8900)
6. [kubeadm init](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/)
7. [Vps](https://billing.hostens.com/clientarea/)