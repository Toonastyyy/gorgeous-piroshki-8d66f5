# Crown Fade Barbers: demo website

Plain HTML, CSS and JavaScript. No build step. Open `index.html` to run it.

## Files
- `index.html`: page content
- `css/styles.css`: styling (colours and fonts are at the top)
- `js/main.js`: menu, gallery viewer, booking form, WhatsApp links, open/closed badge
- `images/`: gallery photos and favicon

## Before showing this to a real customer, replace every placeholder
- [x] `WHATSAPP_NUMBER` in `js/main.js`: set to 2348084050543 (format: country code, no + or leading 0)
- [x] Phone number: set to +234 808 405 0543 in `index.html` (visit section, `tel:` link and the no-JavaScript message)
- [ ] Address (index.html, visit section) and the "Get directions" link
- [ ] Map: replace the `map-card` block with a Google Maps embed
- [ ] Gallery: swap `images/cut-01.svg` ... `cut-10.svg` for real photos (about 1200px wide, under 300 KB each)
- [ ] Shop name, prices, durations and opening hours (hours are in the table AND the constants in `main.js`)
- [ ] Remove the "fictional business" line in the footer
- [ ] Optional: `og:image` for link previews

## What is NOT included (needs a backend or external service)
- Saving bookings, preventing double-booking, real availability
- Automatic confirmations or reminders
- Editing prices or photos without editing the code
- Online payments


## Crown Fade Barbers — Ikorodu setup

- Location: No. 1 Awolowo Road, Ikorodu, Lagos State, Nigeria.
- Booking/contact WhatsApp: 0808 405 0543 (international WhatsApp format in code: 2348084050543).
- Gallery uses remotely hosted Unsplash photos as temporary stock imagery. Replace them with your own shop/cut photos when ready. Internet access is needed to load these photos and Google Fonts.

## Publish free with Netlify

1. Open https://app.netlify.com/drop in a browser and sign in or create a free account.
2. Extract this ZIP first. Upload/drag the **crown-fade-barbers** folder (the folder containing `index.html`, `css`, `js`, and `images`) into the Netlify Drop area. If the page does not accept a folder, upload the extracted folder through Netlify's manual deploy flow.
3. Netlify will provide a public `*.netlify.app` link. Open it on your phone and test the booking form and WhatsApp button.
4. Keep the Netlify link private until you have checked the services, prices, hours and photos.

The booking form opens WhatsApp with a pre-filled message; the customer must press Send, and the booking is not confirmed until the shop replies.
