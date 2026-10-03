# 05 — ADMIN GUIDE

The admin panel is for **you** only. It works on laptop, tablet and phone.

### STEP 1 — Log in to the admin panel

**What you are doing:** Opening the admin area.

**Why you are doing it:** Everything that changes the website happens here, protected by your password.

**Where to click / what to do:**

1. Start the website (double-click start.bat).
2. In the browser type the address below.
3. Type your username and password and press Log in.

**What to type (exact command):**

```
http://localhost:3000/admin/login.html
```

**Expected result:** The Dashboard opens with numbers about your shop.

**If it fails / how to fix it:** 'Too many wrong attempts' - wait 5 minutes. Forgot the password? See 10-TROUBLESHOOTING.md problem 7.

![admin login](images/05-admin-login.png)

![admin dashboard](images/06-admin-dashboard.png)

---

### STEP 2 — Read the Dashboard

**What you are doing:** Understanding the first page.

**Why you are doing it:** It shows what needs your attention.

**Where to click / what to do:**

1. The six boxes show products, available items, out-of-stock items, categories, feedback messages and the average rating.
2. The yellow 'To do' box reminds you to fill in shop details, remove demo products and make backups.
3. The menu on the left (the top bar on a phone) takes you everywhere.

**Expected result:** You can see your numbers. On a phone the menu is a bar you can slide sideways.

![admin dashboard](images/06-admin-dashboard.png)

![mobile admin products](images/16-mobile-admin-products.png)

---

### STEP 3 — Add or rename categories

**What you are doing:** Managing the groups (Spices, Pulses ...) used to organise products.

**Why you are doing it:** Categories let customers filter the product list.

**Where to click / what to do:**

1. Click Categories in the menu.
2. To add: type the name in the box and press Add category.
3. To rename: press Rename next to it and type the new name. All its products follow automatically.
4. To delete: press Delete. This only works when the category has 0 products.

**Expected result:** The category appears in the list and in the product form.

**If it fails / how to fix it:** 'N product(s) still use...' - move or delete those products first.

![admin categories](images/09-admin-categories.png)

---

### STEP 4 — Read customer feedback

**What you are doing:** Seeing what customers wrote on the Contact page.

**Why you are doing it:** Feedback tells you what customers like or want.

**Where to click / what to do:**

1. Click Feedback in the menu.
2. Read the list (newest first). Stars show the rating.
3. Press Delete to remove a message you do not want.

**Expected result:** Feedback appears with the correct date and time.

![admin feedback](images/10-admin-feedback.png)

---

### STEP 5 — Change shop settings

**What you are doing:** Editing the shop details that appear on the website.

**Why you are doing it:** Nothing in the program files needs editing.

**Where to click / what to do:**

1. Click Shop settings in the menu.
2. Change the boxes you want (see the table below).
3. Press Save settings (at the bottom of the page).
4. Open the customer website and press F5 to refresh.

**Expected result:** A green 'Saved' message. The website shows the new information.

**If it fails / how to fix it:** A red message names the box to fix, for example 'Email address does not look right.'

![admin settings](images/11-admin-settings.png)

---

### STEP 6 — Change your password

**What you are doing:** Choosing a new admin password.

**Why you are doing it:** Change it if someone else learned it, or every few months.

**Where to click / what to do:**

1. Click Account in the menu.
2. Type your current password, then the new password twice.
3. Press Change password.

**Expected result:** 'Password changed.' Use the new password next time.

**If it fails / how to fix it:** 'Your current password is not correct' - type the current one again.

---

### STEP 7 — Log out

**What you are doing:** Ending your admin session.

**Why you are doing it:** Important on a shared computer.

**Where to click / what to do:**

1. Click Log out at the bottom of the menu.

**Expected result:** You return to the login page.

---

## How to change each shop setting


| Setting | Where (Admin > Shop settings) | Example | What it changes |
|---|---|---|---|
| Shop name | Shop name | Sasi Maligai | Title at the top of every page |
| Tagline | Tagline | Your neighbourhood grocery shop | Line under the name on the home page |
| Phone | Phone | 98765 43210 | Phone on Home/Contact; customers tap to call |
| WhatsApp | WhatsApp number | 9876543210 | Green WhatsApp buttons. Leave EMPTY to hide them. A 10-digit number gets +91 added |
| Email | Email | shop@example.com | Email on the Contact page |
| Address | Shop address | No. 12, Main Road, Town | Address on Home/Contact/footer. Press Enter for a new line |
| Opening hours | Opening hours | Mon - Sat: 7 AM - 9:30 PM (new line) Sunday: 7 AM - 1 PM | Hours on Home/About/Contact |
| Google Maps | Google Maps link | https://maps.app.goo.gl/... | 'Open in Google Maps' button. If you paste the Embed code (Share > Embed a map) a real map appears on the Contact page |
| Home introduction | Home page introduction | Rice, pulses, oil ... | Paragraph on the home page |
| About text | About page text | (a few sentences) | About page |
| Why shop with us | Why shop with us | Fresh stock every week. | Optional box on the About page |

**Google Maps tip:** open your shop in Google Maps > **Share** > **Embed a map** > **Copy HTML**, and paste the whole text into *Google Maps link*. The website picks out the address by itself and shows a real map on the Contact page. A normal **Copy link** gives only the button.

## Where the information is stored

Settings are saved in the database (the **data** folder), so they survive restarts and are included in backups. You never edit program files for shop details.


[Back to START HERE](01-START-HERE.md)
