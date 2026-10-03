# 04 — WEBSITE GUIDE (what customers see)

![home page](images/01-home-page.png)

## Pages

| Page | Address | What it shows |
|---|---|---|
| Home | `/` | Shop name, introduction, **Call** and **WhatsApp** buttons (only if set), categories, products available today, address, hours |
| Products | `/products.html` | All products with search, category filter and availability filter |
| About | `/about.html` | The About text and "Why shop with us" (both editable in Shop settings) |
| Contact | `/contact.html` | Phone, WhatsApp, email, address, hours, Google Maps button or map, and the feedback form |

Customers **never need an account** to browse.

## Products page

![products search](images/02-products-search.png)

1. Type in **Search** to find products by name or description.
2. Choose a **Category**.
3. Choose **Availability** (all, available only, not available now).
4. Each card shows the **picture, name, price, unit, description and availability**.
5. The list shows 60 products at a time; press **Show more products** for the rest. This keeps the website fast.

## Contact page and feedback

![contact and feedback](images/03-contact-feedback.png)

Customers type their **name**, press **1 to 5 stars**, write a **message** and press **Send feedback**. You read it in **Admin > Feedback**. To stop spam robots the form has a hidden field, and each computer can send 5 messages per hour.

## On phones and tablets

The website adapts to the screen. On a phone the menu hides behind the **&#9776;** button.

![mobile menu](images/14-mobile-home-menu.png) ![mobile products](images/15-mobile-products.png)

## Showing the website to phones on your Wi-Fi (optional)

By default **only this computer** can open the website (this is the safest setting). If you want phones on the same Wi-Fi to open it:

### STEP 1 — Create the optional settings file

**What / why:** the file `.env` holds technical settings. It is optional and never uploaded to GitHub.

1. Open the project folder. Copy `.env.example` and paste it in the same folder.
2. Rename the copy to exactly `.env` (with the dot at the start, no `.txt` at the end).
   * If you cannot see file endings: in File Explorer click **View > Show > File name extensions**.
3. Right-click `.env` > **Open with > Notepad**.
4. Find the line `# HOST=127.0.0.1`, remove the `#` and change it to `HOST=0.0.0.0`. Save.
5. Stop and start the website.

**Expected result:** the black window says it is running. On a phone on the same Wi-Fi open `http://THE-LAPTOP-IP:3000` (find the IP: black window > type `ipconfig` > "IPv4 Address").

**If it fails:** Windows Firewall may ask for permission: press **Allow** for private networks. Government networks often block this; then keep the default.

**Warning:** with `0.0.0.0`, others on that Wi-Fi can also reach the admin login page. Use a strong password. The admin account can only be *created* from the shop computer itself.


[Back to START HERE](01-START-HERE.md)
