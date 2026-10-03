# 06 — PRODUCT GUIDE

![products](images/07-admin-products.png)

### STEP 1 — Add a product

**What you are doing:** Creating a new product.

**Why you are doing it:** Customers see it immediately.

**Where to click / what to do:**

1. Admin > Products > + Add product.
2. Product name: for example Sona Masoori Rice.
3. Category: choose from the list (add new categories on the Categories page).
4. Price: numbers only, for example 65 or 65.50.
5. Unit: kg, litre, packet, piece ...
6. Description (optional): for example 25 kg bag available.
7. Picture (optional): see 'Product pictures' below.
8. Press Save product.

**Expected result:** The product is in the list.

**If it fails / how to fix it:** A red message explains the problem; fix it and save again.

![admin products](images/07-admin-products.png)

![admin add product](images/08-admin-add-product.png)

---

### STEP 2 — Edit a product (change a price)

**What you are doing:** Changing details of an existing product.

**Why you are doing it:** Prices change often.

**Where to click / what to do:**

1. Admin > Products.
2. Find the product (the search box above the list helps).
3. Press Edit.
4. Change what you need and press Save product.

**Expected result:** The list and the customer website show the new price.

**If it fails / how to fix it:** Picture lost? It is only removed if you tick 'Remove the current picture'.

---

### STEP 3 — Mark a product Available or Out of stock

**What you are doing:** The quickest daily job.

**Why you are doing it:** Customers see 'Not available now' instead of asking for something you do not have.

**Where to click / what to do:**

1. Admin > Products.
2. Press the Available / Out of stock button in the Stock column.

**Expected result:** The button changes colour at once.

---

### STEP 4 — Delete a product

**What you are doing:** Removing a product for good.

**Why you are doing it:** For items you will never sell again. For items that are only finished, use Out of stock instead.

**Where to click / what to do:**

1. Admin > Products > press Delete next to the product.
2. Read the question and press OK to confirm.

**Expected result:** The product disappears. It cannot be undone, except by restoring a backup.

**If it fails / how to fix it:** Deleted by mistake? Restore the latest backup (07-BACKUP-RESTORE.md). Make a backup before deleting many products.

---

### STEP 5 — Product pictures

**What you are doing:** Adding a photo.

**Why you are doing it:** Customers like to see what they buy.

**Where to click / what to do:**

1. Allowed: JPG, PNG, WEBP.
2. Large phone photos are made smaller automatically in the browser before upload (about 900 px wide).
3. The server accepts files up to 2 MB.
4. To remove a picture: Edit > tick 'Remove the current picture' > Save.

**Expected result:** The picture appears on the product card.

**If it fails / how to fix it:** 'Only JPG, PNG or WEBP pictures are allowed' - the file is another type (for example a PDF or HEIC). Take a normal photo or convert it. Old pictures stay in the uploads folder on purpose, so older backups still show their pictures.

---

### STEP 6 — Remove the sample (demo) products

**What you are doing:** Cleaning up the examples that come with a brand-new website.

**Why you are doing it:** Customers should only see your real products.

**Where to click / what to do:**

1. Admin > Products > scroll to the bottom.
2. Press Remove demo products and confirm.

**Expected result:** Only products marked '(demo)' are removed; your own products stay. A safety backup is made first.

**If it fails / how to fix it:** The button is not there when there are no demo products - that is correct.

---

## Tips

* Use clear names customers search for ("Toor Dal", not "TD 1kg").
* Keep **units** consistent (kg, litre, packet).
* Update prices as soon as they change; customers see them at once.
* Make a backup before big changes (many deletes or edits).
* On a phone the product list becomes cards, and every button is big enough to tap.


[Back to START HERE](01-START-HERE.md)
