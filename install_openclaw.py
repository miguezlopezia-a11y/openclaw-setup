#!/usr/bin/env python3
"""
Instala Docker + OpenClaw (Moltbot) en el servidor remoto via SSH.
Ejecutar: python install_openclaw.py
"""

import sys
import getpass
import time

try:
    import paramiko
except ImportError:
    print("ERROR: paramiko no encontrado. Ejecuta: pip install paramiko")
    sys.exit(1)

HOST = "204.168.163.167"
USER = "root"
PORT = 22

STEPS = [
    ("Desactivar expiración de contraseña",
     "chage -M 99999 root"),

    ("apt-get update",
     "DEBIAN_FRONTEND=noninteractive apt-get update -y"),

    ("apt-get upgrade",
     "DEBIAN_FRONTEND=noninteractive apt-get upgrade -y"),

    ("Instalar dependencias de Docker",
     "apt-get install -y ca-certificates curl gnupg"),

    ("Añadir clave GPG de Docker",
     "install -m 0755 -d /etc/apt/keyrings "
     "&& curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc "
     "&& chmod a+r /etc/apt/keyrings/docker.asc"),

    ("Añadir repositorio de Docker",
     '. /etc/os-release && '
     'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] '
     'https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" '
     '| tee /etc/apt/sources.list.d/docker.list > /dev/null'),

    ("Instalar Docker Engine + Compose",
     "apt-get update -y && apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"),

    ("Verificar Docker",
     "docker --version && docker compose version"),

    ("Habilitar Docker al inicio",
     "systemctl enable docker && systemctl start docker"),

    ("Instalar git",
     "apt-get install -y git"),

    ("Clonar repositorio OpenClaw/Moltbot",
     "rm -rf /opt/moltbot && git clone https://github.com/moltbot/moltbot.git /opt/moltbot"),

    ("Abrir puerto 18789 en UFW",
     "ufw allow 18789/tcp 2>/dev/null || true"),

    ("Lanzar OpenClaw con Docker",
     "cd /opt/moltbot && chmod +x docker-setup.sh && bash docker-setup.sh"),
]


def run_command(ssh, description, command):
    print(f"\n{'='*60}")
    print(f">>> {description}")
    print(f"{'='*60}")

    stdin, stdout, stderr = ssh.exec_command(
        f"bash -lc {repr(command)}",
        get_pty=True,
        timeout=600,
    )
    stdin.close()

    # Stream output in real time
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="", flush=True)

    exit_code = stdout.channel.recv_exit_status()

    if exit_code != 0:
        print(f"\n[!] Salió con código {exit_code}")
        return False

    print(f"\n[OK] {description}")
    return True


def main():
    print(f"\nConectando a {USER}@{HOST}:{PORT} ...")
    password = getpass.getpass(f"Contraseña de root@{HOST}: ")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(HOST, port=PORT, username=USER, password=password, timeout=15)
        print(f"[OK] Conectado a {HOST}\n")
    except Exception as e:
        print(f"[ERROR] No se pudo conectar: {e}")
        sys.exit(1)

    for i, (description, command) in enumerate(STEPS, 1):
        print(f"\n[Paso {i}/{len(STEPS)}]", end="")
        ok = run_command(ssh, description, command)
        if not ok:
            print(f"\n[!] Fallo en paso {i}: {description}")
            print("    Revisa el error arriba. Puedes continuar manualmente desde el servidor.")
            ssh.close()
            sys.exit(1)

    ssh.close()

    print(f"\n{'='*60}")
    print("  INSTALACION COMPLETADA")
    print(f"{'='*60}")
    print(f"  Accede a OpenClaw en: http://{HOST}:18789/")
    print("  Copia el token de seguridad y pégalo en Settings.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
