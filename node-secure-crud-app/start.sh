#!/bin/bash

os_name=$(grep '^ID=' /etc/os-release | cut -d'=' -f2 | tr -d '"')

if [[ "$os_name" == "ubuntu" ]]; then
    echo "[+] Os system is: Ubuntu "
    sudo snap install docker
else
    echo "[+] $os_name aşkarlandı — APT və manual quraşdırma istifadə olunur..."
    sudo apt update -y
    sudo apt install docker.io -y
    sudo systemctl start docker
    sudo systemctl enable docker

    echo "[+] Docker Compose quraşdırılır..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "[✓] Quraşdırma tamamlandı!"



