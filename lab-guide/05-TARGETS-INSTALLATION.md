# 🎯 Phase 5 : Installation des Cibles Vulnérables (targets VM)

## 📋 Overview

**VM target** : targets  
**Host** : M2 (Fast Kali Laptop)  
**IP** : 10.0.20.11-13  
**Network** : VICTIM (VMnet3)  
**RAM** : 4 GB  
**CPU** : 2 cores  
**Disk** : 60 GB  
**OS** : Ubuntu 22.04 LTS

**Services deployed** :
- ✅ DVWA (Damn Vulnerable Web Application)
- ✅ Metasploitable 2
- ✅ linux-target (Ubuntu Server with vulnerabilities)

**Estimated time** : 1 hour

---

## 🖥️ Step 1 : Create targets VM on VMware (M2)

### 1.1 Create New VM

1. **File → New Virtual Machine**
2. **Configuration** : Custom (advanced)
3. **Next**

### 1.2 VM Configuration

#### Hardware Compatibility
- **Compatibility** : Workstation 17.x
- **Next**

#### Guest OS Installation
- **Installer from** : ISO image file
- **ISO** : `ubuntu-22.04.3-live-server-amd64.iso`
- **Next**

#### Guest OS
- **Guest OS** : Linux
- **Version** : Ubuntu 64-bit
- **Next**

#### Virtual Machine Name
- **Name** : `targets`
- **Location** : `C:\VMs\InfracentraLab\targets`
- **Next**

#### Processors
- **Number of processors** : 1
- **Number of cores per processor** : 2
- **Next**

#### Memory
- **Memory** : 4096 MB (4 GB)
- **Next**

#### Network Type
- **Network Connection** : Host-only → VMnet3 (VICTIM)
- **Next**

#### I/O Controller Type
- **I/O Controller Type** : LSI Logic (recommended)
- **Next**

#### Virtual Disk Type
- **Virtual Disk Type** : SCSI (recommended)
- **Next**

#### Select a Disk
- **Disk** : Create a new virtual disk
- **Next**

#### Specify Disk Capacity
- **Maximum disk size** : 60 GB
- **Store virtual disk as a single file** : ✅ Check
- **Next**

#### Ready to Create
- ✅ Check "Power on this virtual machine after creation"
- **Finish**

---

## 🚀 Step 2 : Install Ubuntu 22.04 LTS

### 2.1 Installation

Follow the same steps as soc-siem, with these differences :

#### Network Configuration
- **Interface** : ens33 (or ens160)
- **IPv4** : Manual
- **Subnet** : `10.0.20.0/24`
- **Address** : `10.0.20.11`
- **Gateway** : `10.0.20.1`
- **Name servers** : `10.0.20.1,8.8.8.8`

#### Login
- **Username** : `target`
- **Password** : `TargetPassword2027!`

---

## 🔧 Step 3 : Install DVWA (Damn Vulnerable Web Application)

### 3.1 Install Dependencies

```bash
# On targets VM
sudo su -

# Update system
apt update && apt upgrade -y

# Install Apache, PHP, MySQL
apt install -y apache2 php php-mysql php-gd php-xml php-mbstring mariadb-server git

# Start services
systemctl start apache2
systemctl start mariadb
systemctl enable apache2
systemctl enable mariadb
```

### 3.2 Configure MySQL

```bash
# Secure MySQL
mysql_secure_installation

# Set root password : DVWAPassword2027!
# Remove anonymous users : Y
# Disallow root login remotely : Y
# Remove test database : Y
# Reload privilege tables : Y

# Create DVWA database
mysql -u root -p
```

```sql
CREATE DATABASE dvwa;
CREATE USER 'dvwa'@'localhost' IDENTIFIED BY 'dvwa_password';
GRANT ALL PRIVILEGES ON dvwa.* TO 'dvwa'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Install DVWA

```bash
# Clone DVWA
cd /var/www/html
git clone https://github.com/digininja/DVWA.git

# Set permissions
chown -R www-data:www-data DVWA
chmod -R 755 DVWA

# Configure DVWA
cd DVWA/config
cp config.inc.php.dist config.inc.php
nano config.inc.php
```

Edit configuration :
```php
$_DVWA[ 'db_server' ] = 'localhost';
$_DVWA[ 'db_database' ] = 'dvwa';
$_DVWA[ 'db_user' ] = 'dvwa';
$_DVWA[ 'db_password' ] = 'dvwa_password';
$_DVWA[ 'default_security_level' ] = 'low';
```

### 3.4 Access DVWA

```bash
# Open browser
http://10.0.20.11/DVWA

# Login
Username : admin
Password : password
```

---

## 🔥 Step 4 : Install Metasploitable 2

### 4.1 Download Metasploitable 2

```bash
# On targets VM
cd /opt

# Download Metasploitable 2
wget https://sourceforge.net/projects/metasploitable/files/Metasploitable2/metasploitable2-2.0.0.zip

# Extract
unzip metasploitable2-2.0.0.zip
cd metasploitable2
```

### 4.2 Configure Network

```bash
# Edit network configuration
nano /etc/network/interfaces
```

```
auto eth0
iface eth0 inet static
    address 10.0.20.12
    netmask 255.255.255.0
    gateway 10.0.20.1
    dns-nameservers 10.0.20.1 8.8.8.8
```

### 4.3 Start Metasploitable 2

```bash
# Start the VM
# Note : Metasploitable 2 is a complete VM image
# You can run it directly in VMware

# Default credentials
# Username : msfadmin
# Password : msfadmin
```

**Alternative** : Use Metasploitable 2 as a separate VM

```bash
# Import the Metasploitable 2 OVF into VMware
# File → Open → Select metasploitable2.vmx
# Configure network : VMnet3 (VICTIM)
# IP : 10.0.20.12
```

---

## 🐧 Step 5 : Configure linux-target

### 5.1 Install Vulnerable Services

```bash
# On targets VM (10.0.20.11)
sudo su -

# Install vulnerable SSH version (for testing)
apt install -y openssh-server

# Configure SSH to allow root login (for testing)
nano /etc/ssh/sshd_config
```

```
PermitRootLogin yes
PasswordAuthentication yes
```

```bash
# Restart SSH
systemctl restart ssh

# Set root password
passwd
# Set password : root123

# Install vulnerable web services
apt install -y nginx php php-fpm

# Create vulnerable PHP file
cat > /var/www/html/vuln.php << 'EOF'
<?php
// Vulnerable to SQL injection
$id = $_GET['id'];
$conn = new mysqli('localhost', 'root', 'root123', 'test');
$result = $conn->query("SELECT * FROM users WHERE id = $id");
while($row = $result->fetch_assoc()) {
    echo $row['username'] . "<br>";
}
?>
EOF

# Install vulnerable FTP
apt install -y vsftpd

# Configure FTP to allow anonymous (for testing)
nano /etc/vsftpd.conf
```

```
anonymous_enable=YES
local_enable=YES
write_enable=YES
```

```bash
# Restart FTP
systemctl restart vsftpd
```

### 5.2 Create Test Database

```bash
# Install MySQL
apt install -y mariadb-server

# Create test database
mysql -u root -proot123
```

```sql
CREATE DATABASE test;
USE test;
CREATE TABLE users (id INT, username VARCHAR(50), password VARCHAR(50));
INSERT INTO users VALUES (1, 'admin', 'admin123');
INSERT INTO users VALUES (2, 'user', 'user123');
EXIT;
```

---

## ✅ Step 6 : Verification and Tests

### 6.1 Test DVWA

```bash
# From Kali VM (10.0.30.10)
curl http://10.0.20.11/DVWA/

# Should return DVWA login page
```

### 6.2 Test Metasploitable 2

```bash
# From Kali VM
nmap -sV 10.0.20.12

# Should show multiple open ports (21, 22, 23, 25, 80, 443, 445, etc.)
```

### 6.3 Test linux-target

```bash
# From Kali VM
# Test SSH
ssh root@10.0.20.11
# Password : root123

# Test FTP
ftp 10.0.20.11
# Anonymous login

# Test web vulnerability
curl "http://10.0.20.11/vuln.php?id=1"
```

### 6.4 Install Wazuh Agents

```bash
# On each target VM
# Download Wazuh agent
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg

echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee /etc/apt/sources.list.d/wazuh.list

apt-get update
apt-get install wazuh-agent

# Configure agent
nano /var/ossec/etc/ossec.conf
```

```xml
<client>
  <server>
    <address>10.0.10.10</address>
    <port>1514</port>
    <protocol>tcp</protocol>
  </server>
</client>
```

```bash
# Register agent with Wazuh manager
# On Wazuh manager (soc-siem)
/var/ossec/bin/manage_agents -a <agent_id> -n <hostname> -i <ip>

# Start agent
systemctl start wazuh-agent
systemctl enable wazuh-agent
```

---

## 🐛 Troubleshooting

### Problem : DVWA doesn't load

```bash
# Check Apache logs
tail -f /var/log/apache2/error.log

# Check permissions
chown -R www-data:www-data /var/www/html/DVWA
chmod -R 755 /var/www/html/DVWA
```

### Problem : Metasploitable 2 network issues

```bash
# Check network configuration
ifconfig
ping 10.0.20.1

# Restart network
systemctl restart networking
```

### Problem : Wazuh agent can't connect

```bash
# Check firewall on soc-siem
ufw status

# Open port 1514
ufw allow 1514/tcp
ufw allow 1514/udp
```

---

## 📚 Resources

- [DVWA Documentation](https://github.com/digininja/DVWA)
- [Metasploitable 2](https://sourceforge.net/projects/metasploitable/files/Metasploitable2/)
- [Wazuh Agent Installation](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/index.html)

---

## ✅ Phase 5 Checklist

- [ ] targets VM created on VMware (M2)
- [ ] Ubuntu 22.04 LTS installed
- [ ] Network configured (10.0.20.11)
- [ ] DVWA deployed and accessible
- [ ] Metasploitable 2 deployed and accessible
- [ ] linux-target configured with vulnerabilities
- [ ] Wazuh agents installed on all targets
- [ ] Network connectivity tested from Kali

---

## 🎉 Phase 5 Complete!

targets VM is now operational with :
- ✅ DVWA for web application testing
- ✅ Metasploitable 2 for exploitation testing
- ✅ linux-target for Linux vulnerability testing
- ✅ Wazuh agents sending logs to soc-siem

**Next step** : Phase 6 - Kali Configuration

---

**Estimated time** : 1 hour  
**Difficulty** : ⭐⭐ (Intermediate)  
**Status** : ✅ Ready for Phase 6

---

## 📊 Quick Access

| Service | URL | Login | Password |
|---------|-----|-------|----------|
| DVWA | http://10.0.20.11/DVWA | admin | password |
| Metasploitable 2 | http://10.0.20.12 | msfadmin | msfadmin |
| linux-target SSH | ssh root@10.0.20.11 | root | root123 |
| linux-target FTP | ftp 10.0.20.11 | anonymous | (any) |
| targets SSH | ssh target@10.0.20.11 | target | TargetPassword2027! |
