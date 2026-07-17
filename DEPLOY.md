# Deploying Apex Rentals to a DigitalOcean Droplet

Stack on the server: **Ubuntu 24.04 + Node 20 + PM2 + Caddy**.
Result: the app runs on a fixed IP, Caddy serves it over HTTPS at
`apexrentalfleet.com`, and it stays up across reboots/crashes.

> Database (Neon) and email (Resend) are already cloud-hosted — the server only
> runs the Next.js app.

---

## 0. Prerequisites (one-time, in your accounts)

1. **GitHub** account + push this repo (see `README`/below).
2. **DigitalOcean** account.

## 1. Create the Droplet

DO dashboard → **Create → Droplet**:
- Image: **Ubuntu 24.04 LTS**
- Plan: **Basic → Regular → $6/mo** (1 GB RAM is enough)
- Region: **New York (NYC1/NYC3)**
- Authentication: **SSH key** (recommended) or password
- Create.

Note the Droplet's **public IP** (e.g. `164.90.xx.xx`) — this is your fixed IP
(use it for TSD whitelisting later).

## 2. Point the domain (Squarespace DNS)

In Squarespace → domain `apexrentalfleet.com` → DNS → Custom records, add:

| Type | Host | Value |
|------|------|-------|
| A    | `@`  | `<DROPLET_IP>` |
| A    | `www`| `<DROPLET_IP>` |

(Leave the existing `send.*` email records alone.)

## 3. Server setup (SSH in and run these)

```bash
ssh root@<DROPLET_IP>

# system + Node 20 + git + build tools
apt update && apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt -y install nodejs git

# Caddy (auto-HTTPS reverse proxy)
apt -y install debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt -y install caddy

# PM2 (keeps the app running)
npm install -g pm2

# firewall
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## 4. Deploy the app

```bash
cd /var/www || (mkdir -p /var/www && cd /var/www)
git clone https://github.com/<YOU>/apex-website.git
cd apex-website

# create the production env file (copy values from your local .env)
nano .env    # paste DATABASE_URL, NEXT_PUBLIC_SITE_URL, ADMIN_PASSWORD,
             # SESSION_SECRET, RESEND_API_KEY, NOTIFY_EMAIL, FROM_EMAIL,
             # NEXT_PUBLIC_GA_ID

npm ci
npx prisma generate
npm run build

# start under PM2 on port 3000, survive reboots
pm2 start npm --name apex -- start
pm2 save
pm2 startup systemd -u root --hp /root   # run the line it prints
```

> Tip: use the Neon **pooled** connection string for `DATABASE_URL` in production
> (Neon dashboard → Connection string → "Pooled connection").

## 5. Wire up Caddy

```bash
cp /var/www/apex-website/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy
```

Once DNS has propagated, open **https://apexrentalfleet.com** — Caddy will have
issued the certificate automatically. Done. ✅

---

## Redeploy after changes (one-liner)

```bash
cd /var/www/apex-website && git pull && npm ci && npx prisma generate && npm run build && pm2 restart apex
```

## Maintenance

- OS security updates: `apt update && apt -y upgrade` occasionally (or enable
  `unattended-upgrades`).
- Logs: `pm2 logs apex`.
- App status: `pm2 status`.
