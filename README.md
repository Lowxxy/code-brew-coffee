# Code Brew Coffee — GitHub Pages Website

A responsive, launch-ready **preview website** for Code Brew Coffee, using the five supplied logos.

## Publish on GitHub Pages

1. Create a new **public** GitHub repository (for example `code-brew-coffee`).
2. Upload **all contents of this folder** into the repository root: `index.html`, `styles.css`, `script.js`, and the `assets` folder with all five images.
3. Go to your repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch** → branch **main** → folder **/(root)** → **Save**.
5. Your URL will be `https://YOUR-USERNAME.github.io/code-brew-coffee/` when GitHub Pages deployment finishes.

You can also open `index.html` locally on a computer to preview the site before publishing.

## Logo usage

- `assets/logo-primary.png` — full logo with “coffee”; in the Our Story section.
- `assets/logo-no-subtitle.png` — logo without “coffee”; footer.
- `assets/logo-mark.png` — standalone winged coffee IV; hero and favicon.
- `assets/logo-secondary.png` — smaller vertical wing / IV symbol; menu card and opening soon.
- `assets/logo-wordmark.png` — winged Code Brew text; navigation header.

All images are transparent PNGs, processed from the five images supplied for this project.

## Edit the menu later

Open `index.html`. Each item uses a line like:

`<div class="menu-line"><span>________________________</span><strong>$0.00</strong></div>`

Replace the underscores with an item name and `$0.00` with its actual price. Edit section titles and descriptions in each `<article class="menu-card">` as needed. The filtering buttons already work. `data-category="coffee"`, `"refreshers"`, or `"extras"` control which cards display when a filter is selected.

## Photos

The featured image area currently uses designed placeholder tiles. Once real product photography is ready, replace a `.photo-slot`'s content with an `<img>` tag and apply a new CSS rule for sizing/cropping.

## Before opening

- This is an **informational menu mockup**. There is no checkout or real pricing.
- The **Save a Reminder** button opens the visitor's own email app with a reminder draft; it is **not** a subscriber collection system. A mailing-list provider can be connected later.
- No business email, address, social accounts, or launch date were invented.
- Update policies, menu and contact details before taking orders.

## Files

- `index.html` — entire one-page website
- `styles.css` — desktop and mobile styling
- `script.js` — working menu filters and mobile navigation
- `assets/` — five transparent logos
