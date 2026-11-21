# AYSAH INDUSTRIES LTD – Website

React website with an admin panel, client accounts and Pi Network payments.
Owner: **MUTABAZI Yves** · aysah22n@gmail.com · +250 784 578 722

Free hosting:
- **GitHub Pages**: the website itself
- **Supabase** (free plan): database, client logins, photo storage and the two small Pi payment functions
- **Pi Developer Portal**: makes the site a Pi app, so clients can pay in Pi inside the Pi Browser

Until Supabase is connected, the site runs in **DEMO mode**. All data is kept only in the visitor's browser.
Demo admin login: `aysah22n@gmail.com` / `Aysah@2026`

---

## 1. Create the GitHub account (≈3 min)
1. Go to <https://github.com/signup> and sign up with **aysah22n@gmail.com**.
2. Username: **aysahindustries** (or the closest name that's free). Your website address becomes
   **https://aysahindustries.github.io**
3. Confirm the code GitHub sends to your email.

## 2. Put the website on GitHub
1. Click **+ → New repository** and name it exactly **`aysahindustries.github.io`** (your username + `.github.io`). Set it to **Public** and click **Create**.
2. On the new repository page, click **uploading an existing file**. Drag in **everything inside this folder**, including the hidden `.github` folder, but **not** `node_modules`. Then click **Commit changes**.
   (If you use Git instead: `git init && git add . && git commit -m "site" && git branch -M main && git remote add origin https://github.com/aysahindustries/aysahindustries.github.io.git && git push -u origin main`)
3. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open the **Actions** tab. When the green tick appears (about 1–2 min), the site is live at **https://aysahindustries.github.io**. At this point it's still in DEMO mode.

## 3. Connect the real database (Supabase)
1. Sign up at <https://supabase.com> with the same email. Click **New project**, name it `aysah`, and choose a strong database password. Pick a region (e.g. Frankfurt).
2. Go to **SQL Editor → New query**, paste the whole of `supabase/schema.sql` and click **Run**.
3. Go to **Authentication → URL Configuration → Site URL** and enter `https://aysahindustries.github.io`.
4. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.
5. Back on GitHub, open the repository and go to **Settings → Secrets and variables → Actions → Variables tab → New repository variable**. Add these three:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | the Project URL |
   | `VITE_SUPABASE_ANON_KEY` | the anon key |
   | `VITE_PI_SANDBOX` | `true` (change to `false` when you go live on Mainnet) |
6. Go to **Actions → Deploy website to GitHub Pages → Run workflow**. When it finishes, the DEMO badge disappears.
7. Open the site and click **Iyandikishe** (Register) with **aysah22n@gmail.com**. That email automatically becomes **Admin**. Confirm the email, sign in, then open **Ubuyobozi / Admin**.

## 4. Turn on Pi payments
1. Open the **Pi Browser** on your phone and go to `develop.pi`. Click **Register an App**, name it `AYSAH INDUSTRIES` and choose **Testnet** first.
2. **App hosting**: choose *Self hosted*. **App URL**: `https://aysahindustries.github.io`
3. **Verify domain**: the portal gives you a key. Create a file named `validation-key.txt` inside the `public` folder, paste the key into it, upload it to GitHub and wait for the deploy to finish. Then press **Verify** in the portal.
4. **Wallet**: connect the Pi wallet that should receive the payments.
5. Copy the **Server API Key** from the portal.
6. Deploy the payment functions. On a computer with Node installed, open this folder and run:
   ```
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase secrets set PI_API_KEY=YOUR_PI_SERVER_API_KEY
   npx supabase functions deploy pi-approve
   npx supabase functions deploy pi-complete
   ```
   (`YOUR_PROJECT_REF` is the code in your Supabase URL: `https://<ref>.supabase.co`.)
7. Test it: open the site in the Pi Browser, register a client, then go to **Ibicuruzwa** and tap **Gura na Pi**.
8. To go live: register a second app on **Mainnet** (this needs KYC), set its key with `secrets set`, and change `VITE_PI_SANDBOX` to `false`.

> Never put the Pi Server API Key in the website files or in GitHub. It belongs only in `supabase secrets`.

## What the admin can manage
- **Site settings**: company name, taglines, **logo**, **favicon**, colours, phone, email, WhatsApp, address, opening hours, **Google map** (shown in the footer and on the Contact page), About/Mission/Vision texts and photo, footer text, social links
- **Carousel**: home page slides (photo and two-line title, in RW and EN)
- **Products & services**: photo, category, description, price in Pi (price 0 = clients send a request instead of paying), available/sold, featured
- **Team**: members with photo, role and contacts
- **Orders**: every purchase and request. Change the status (processing → delivered) and leave a note; the client sees both in **Konti yanjye**
- **Messages**: messages from the Contact page
- **Clients**: everyone who registered. You can also give admin rights to another person

## Develop locally
```
npm install
cp .env.example .env   # fill in, or leave empty for demo mode
npm run dev
```
