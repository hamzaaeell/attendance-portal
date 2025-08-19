# Employee Attendance Management System

A MERN stack application for managing employee attendance with CRUD operations.

## Features
- Employee account management
- Attendance marking (check-in/check-out)
- View attendance records
- Employee dashboard

## Tech Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express and TypeScript
- Database: MongoDB
- Authentication: JWT

## Project Structure
```
├── backend/          # Node.js TypeScript API
├── frontend/         # React TypeScript app
└── README.md
```

## Setup Instructions

### Local Development

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Docker Setup

#### Production (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

#### Development with Docker
```bash
# Start only MongoDB with Docker
docker-compose -f docker-compose.dev.yml up mongodb -d

# Then run backend and frontend locally
cd backend && npm run dev
cd frontend && npm start
```

#### Individual Container Builds
```bash
# Build backend image
docker build -t attendance-backend ./backend

# Build frontend image
docker build -t attendance-frontend ./frontend

# Run backend container
docker run -p 5001:5001 --env-file backend/.env.production attendance-backend

# Run frontend container
docker run -p 3001:80 attendance-frontend
```

### Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_jwt_secret_key_here
```

# Complete HashiCorp Vault Setup Guide

## What is HashiCorp Vault?

HashiCorp Vault is a **secrets management system** that helps you:
- Store sensitive data (passwords, API keys, certificates)
- Generate dynamic secrets (temporary database credentials)
- Encrypt data
- Manage access policies

Think of it as a highly secure, centralized safe for all your organization's secrets.

## Key Concepts You Need to Understand

### 1. **Sealed vs Unsealed State**

**Sealed Vault:**
- When Vault starts, it's in a "sealed" state
- All data is encrypted and inaccessible
- Even if someone gains access to the server, they can't read the secrets
- Vault cannot perform any operations while sealed

**Unsealed Vault:**
- Vault has been "unlocked" using unseal keys
- Data can be decrypted and accessed (with proper authentication)
- Normal operations can be performed

**Why this design?**
- Even if your server is compromised, attackers can't access secrets without unseal keys
- Provides an additional layer of security beyond just authentication

### 2. **Unseal Keys (Master Key Shares)**

- When you initialize Vault, it creates a **master encryption key**
- This master key is split into **5 parts** (called shares) using Shamir's Secret Sharing
- You need **3 out of 5 shares** to reconstruct the master key and unseal Vault
- This prevents any single person from having complete control

**Your unseal keys:**
```
Unseal Key 1: GhXzRy+lsjdfwekslfjjnwlek/71+sdTMcRs6
Unseal Key 2: BuXe/eajfhsleasfkljeajsflkjlkjklksj+d
Unseal Key 3: MnQJiPSt7Pk3ekjn1gLDYPpKTnUFXPWq/z0NI
Unseal Key 4: eCphffWDxlJD2OmrvGYrA9SeEcFW+W4xYC61B
Unseal Key 5: +fzlnvX6ekXZaNQtEbgHrSkt2xkjZGqoCih5o
```

### 3. **Root Token**

- The **root token** is like the "master password" for Vault
- It has unlimited permissions - can do anything in Vault
- Generated only once during initialization
- Should be used only for initial setup, then revoked for security

**Your root token:** `your root token`

## Complete Setup Process - Step by Step

### Phase 1: Installation and Basic Configuration

1. **Install Vault** (you did this previously)
   ```bash
   # Add HashiCorp repository and install
   sudo apt update && sudo apt install vault
   ```

2. **Create Configuration File**
   ```bash
   sudo nano /etc/vault.d/vault.hcl
   ```

3. **Configuration Explained:**
   ```hcl
   storage "raft" {
     path    = "/opt/vault/data"      # Where Vault stores encrypted data
     node_id = "node1"               # Unique identifier for this Vault node
   }

   listener "tcp" {
     address     = "0.0.0.0:8200"    # Listen on all interfaces, port 8200
     tls_disable = 1                 # Disable TLS (use only in dev/testing)
   }

   api_addr     = "http://172.16.1.177:8200"  # How clients connect to this Vault
   cluster_addr = "http://172.16.1.177:8201"  # How Vault nodes communicate
   ui           = true                         # Enable web interface
   disable_mlock = true                       # Don't lock memory (needed for some systems)
   ```

4. **Create Data Directory with Proper Permissions**
   ```bash
   sudo mkdir -p /opt/vault/data
   sudo chown -R vault:vault /opt/vault/data
   sudo chmod 755 /opt/vault/data
   ```

5. **Start Vault Service**
   ```bash
   sudo systemctl enable vault
   sudo systemctl start vault
   ```

### Phase 2: Initialization (One-Time Process)

6. **Set Vault Address**
   ```bash
   export VAULT_ADDR=http://172.16.1.177:8200
   ```

7. **Initialize Vault** (This happens only once, ever!)
   ```bash
   vault operator init
   ```
   
   **What happens during initialization:**
   - Vault generates a master encryption key
   - Splits the key into 5 shares (unseal keys)
   - Creates the root token
   - Sets up the initial security configuration
   - **This can never be done again for this Vault instance**

### Phase 3: Unsealing (Required after every restart)

8. **Unseal Vault** (Need 3 out of 5 keys)
   ```bash
   vault operator unseal [key1]
   vault operator unseal [key2] 
   vault operator unseal [key3]
   ```

   **What happens during unsealing:**
   - Vault reconstructs the master key from the 3 shares
   - Decrypts the encryption keys
   - Makes the stored secrets accessible
   - Changes state from "sealed" to "unsealed"

### Phase 4: Authentication and Usage

9. **Login with Root Token**
   ```bash
   vault login [root_token]
   ```

10. **Verify Everything Works**
    ```bash
    vault status                    # Check Vault status
    vault secrets enable -path=secret kv-v2  # Enable secrets engine
    vault kv put secret/test foo=bar         # Store a secret
    vault kv get secret/test                 # Retrieve the secret
    ```

## The Complete Workflow Explained

### What You Actually Did:

1. **🏗️ Built the Safe**: Installed Vault and configured where/how it runs
2. **🔐 Created the Lock**: Initialized Vault, generating the master key and splitting it
3. **🗝️ Opened the Safe**: Unsealed Vault using 3 of the 5 key shares
4. **👤 Logged In**: Authenticated using the root token
5. **✅ Tested It**: Verified you can store and retrieve secrets

### Key Files and Their Purpose:

- `/etc/vault.d/vault.hcl` - Main configuration file
- `/opt/vault/data/` - Encrypted data storage
- `/lib/systemd/system/vault.service` - System service definition

### Network Configuration:

- **Local Interface**: `172.16.1.177:8200` (your server's private IP)
- **Port 8200**: Vault API and Web UI
- **Port 8201**: Vault cluster communication (if using multiple nodes)

## Security Considerations

### In Your Current Setup:
- ✅ Vault data is encrypted at rest
- ✅ Requires unseal keys to access data
- ⚠️ Using HTTP instead of HTTPS (only for testing!)
- ⚠️ Using root token (should be temporary)

### For Production:
1. **Enable TLS/HTTPS** - Never use HTTP in production
2. **Distribute Unseal Keys** - Give different keys to different trusted people
3. **Set Up Proper Authentication** - Don't use root token for daily operations
4. **Create Policies** - Limit what different users can do
5. **Use Auto-Unseal** - AWS KMS, Azure Key Vault, etc.
6. **Regular Backups** - Of your Vault data
7. **Monitoring and Auditing** - Track who accesses what

## Common Operations You'll Use:

```bash
# Check if Vault is sealed/unsealed
vault status

# Seal Vault (locks it)
vault operator seal

# Unseal Vault (unlocks it - need 3 keys)
vault operator unseal [key1]
vault operator unseal [key2]
vault operator unseal [key3]

# Login
vault login [token]

# Store secrets
vault kv put secret/myapp username=admin password=secret123

# Read secrets
vault kv get secret/myapp

# List secrets
vault kv list secret/
```

## Troubleshooting Tips:

1. **"No route to host"** - Check firewall rules and network configuration
2. **"TLS handshake error"** - Mismatch between HTTP/HTTPS in config and client
3. **"Client sent HTTP to HTTPS server"** - Config says HTTPS but you're using HTTP
4. **"Permission denied"** - Check file ownership and permissions
5. **"Vault is sealed"** - Need to unseal with 3 keys after restart

This setup gives you a fully functional Vault instance for development and testing!

---


# Enable the KV secrets engine at the 'secret' path if it doesn't already exist.
vault secrets enable -path=secret kv-v2

# Store your application's sensitive configuration in a specific path.
# This example uses 'secret/myapp/config' but you can choose any path.
vault kv put secret/myapp/config \
    PORT=5001 \
    MONGODB_URI="mongodb+srv://..." \
    JWT_SECRET="your_jwt_secret_key_here"

# Retrieve the stored secret to verify it was saved correctly.
vault kv get secret/myapp/config


# github-actions-policy.hcl
# This policy grants read-only access to the specified secret path.
# Note the '/data/' in the path for kv-v2 secrets engines.
path "secret/data/myapp/config" {
  capabilities = ["read"]
}




# Apply the policy with a descriptive name, like 'github-actions'.
vault policy write github-actions github-actions-policy.hcl


# Generate a token with the 'github-actions' policy.
# Using '-format=json' makes it easy to parse the output in a script.
vault token create -policy=github-actions -format=json






## API Endpoints
- POST /api/auth/register - Register employee
- POST /api/auth/login - Login employee
- GET /api/employees - Get all employees
- POST /api/attendance/checkin - Check in
- POST /api/attendance/checkout - Check out
- GET /api/attendance/:employeeId - Get attendance records
