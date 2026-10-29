// Progressive scroll reveals. If JavaScript is disabled, the page stays visible.
document.documentElement.classList.add("js-ready");
const revealTargets = document.querySelectorAll(
  ".section h2, .section-intro, .menu-group, .gallery-item, .booking-intro, .booking-form, .visit-layout > div"
);
revealTargets.forEach((element, index) => {
  element.classList.add("reveal");
  if (element.matches(".menu-group, .gallery-item")) {
    element.dataset.delay = String((index % 4) + 1);
  }
});
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

// Mobile menu: open/close when the hamburger button is tapped
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#main-nav");

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", isOpen);
});

// Close the menu after tapping a link (so it doesn't cover the page)
nav.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Keep the footer year current
document.querySelector("#year").textContent = new Date().getFullYear();

// ===== Gallery lightbox =====
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.querySelector("#lightbox");
const lbImg = document.querySelector("#lb-img");
const lbCaption = document.querySelector("#lb-caption");
let current = 0;

function showPhoto(index) {
  // the % trick makes the numbers wrap: after the last photo comes the first
  current = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[current];
  const img = item.querySelector("img");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = item.dataset.caption;
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    showPhoto(index);
    lightbox.showModal();          // built-in: dims the page, traps focus, Esc closes it
  });
});

document.querySelector(".lb-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lb-prev").addEventListener("click", () => showPhoto(current - 1));
document.querySelector(".lb-next").addEventListener("click", () => showPhoto(current + 1));

// Clicking the dark area outside the photo closes the viewer
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

// Arrow keys move between photos while the viewer is open
document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") showPhoto(current - 1);
  if (event.key === "ArrowRight") showPhoto(current + 1);
});

// ===== Booking form =====
// IMPORTANT: replace with the shop's real WhatsApp number.
// Use international format with no "+", spaces or leading zero (Nigeria = 234...).
const WHATSAPP_NUMBER = "2348084050543"; // Crown Fade Barbers: 08084050543

// Opening times. Slots start every 30 minutes; the last one starts 30 min before closing.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 20;
const SLOT_MINUTES = 30;
const MIN_NOTICE_MINUTES = 60;   // today's slots must be at least 1 hour away

const form = document.querySelector("#booking-form");
const serviceSelect = form.elements.service;
const dateInput = form.elements.date;
const timeSelect = form.elements.time;
const statusBox = document.querySelector("#booking-status");

// 1. Fill the service dropdown from the price list, so prices are only typed once.
document.querySelectorAll("#services .price-list li").forEach((li) => {
  const name = li.querySelector(".svc-name").firstChild.textContent.trim();
  const price = li.querySelector(".svc-price").textContent.trim();
  serviceSelect.add(new Option(`${name} (${price})`, `${name} - ${price}`));
});

// 2. Limit the date picker: today up to 60 days ahead.
// (We build the date by hand because toISOString() uses UTC, which can be a day off.)
function toLocalISO(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const today = new Date();
const lastDay = new Date();
lastDay.setDate(today.getDate() + 60);
dateInput.min = toLocalISO(today);
dateInput.max = toLocalISO(lastDay);

// 3. Build the time dropdown whenever the date changes.
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function buildTimes() {
  timeSelect.innerHTML = "";
  dateInput.setCustomValidity("");

  if (!dateInput.value) {
    timeSelect.add(new Option("Pick a date first", ""));
    timeSelect.disabled = true;
    return;
  }

  const chosen = new Date(dateInput.value + "T00:00:00");
  if (chosen.getDay() === 0) {                       // 0 = Sunday
    dateInput.setCustomValidity("We are closed on Sundays. Please choose Monday to Saturday.");
    dateInput.reportValidity();
    timeSelect.add(new Option("Closed on Sundays", ""));
    timeSelect.disabled = true;
    return;
  }

  let earliest = OPEN_HOUR * 60;
  if (dateInput.value === toLocalISO(new Date())) {  // booking for today: hide past times
    const now = new Date();
    earliest = Math.max(earliest, now.getHours() * 60 + now.getMinutes() + MIN_NOTICE_MINUTES);
  }

  timeSelect.add(new Option("Choose a time", ""));
  for (let m = OPEN_HOUR * 60; m <= CLOSE_HOUR * 60 - SLOT_MINUTES; m += SLOT_MINUTES) {
    if (m >= earliest) timeSelect.add(new Option(formatTime(m), formatTime(m)));
  }
  if (timeSelect.options.length === 1) {
    timeSelect.options[0].text = "No more slots today";
    timeSelect.disabled = true;
  } else {
    timeSelect.disabled = false;
  }
}
dateInput.addEventListener("change", buildTimes);

// Tidy the phone number as it is typed (remove spaces and dashes)
form.elements.phone.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[\s-]/g, "");
});

// 4. On submit: check the form, then open WhatsApp with the message ready.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;      // shows the browser's own error messages

  const niceDate = new Date(dateInput.value + "T00:00:00").toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const lines = [
    "Hello Crown Fade Barbers, I would like to book:",
    `Name: ${form.elements.name.value.trim()}`,
    `Phone: ${form.elements.phone.value}`,
    `Service: ${serviceSelect.value}`,
    `Date: ${niceDate}`,
    `Time: ${timeSelect.value}`,
  ];
  const notes = form.elements.notes.value.trim();
  if (notes) lines.push(`Notes: ${notes}`);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");

  statusBox.innerHTML =
    `WhatsApp should have opened with your request. Press <strong>Send</strong> there. ` +
    `Your booking is not confirmed until we reply. ` +
    `<a href="${url}" target="_blank" rel="noopener">WhatsApp did not open? Tap here.</a>`;
});

// ===== WhatsApp links =====
// Every link marked data-whatsapp gets the shop's number from WHATSAPP_NUMBER above.
const chatMessage = "Hello Crown Fade Barbers, I have a question.";
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(chatMessage)}`;
});

// ===== Open / closed badge and highlighted day =====
// Uses Lagos time, so it is right even if the visitor's phone is in another country.
function lagosNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const dayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: dayNumbers[get("weekday")],
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

function updateOpenStatus() {
  const { day, minutes } = lagosNow();
  const badge = document.querySelector("#open-status");
  const isOpen = day !== 0 && minutes >= OPEN_HOUR * 60 && minutes < CLOSE_HOUR * 60;

  document.querySelectorAll(".hours tr").forEach((row) => {
    row.classList.toggle("is-today", Number(row.dataset.day) === day);
  });

  badge.classList.toggle("is-open", isOpen);
  badge.classList.toggle("is-closed", !isOpen);
  if (isOpen) {
    badge.textContent = `Open now · closes ${formatTime(CLOSE_HOUR * 60)}`;
  } else if (day !== 0 && minutes < OPEN_HOUR * 60) {
    badge.textContent = `Closed now · opens today at ${formatTime(OPEN_HOUR * 60)}`;
  } else if (day === 0 || day === 6) {
    badge.textContent = `Closed now · opens Monday at ${formatTime(OPEN_HOUR * 60)}`;
  } else {
    badge.textContent = `Closed now · opens tomorrow at ${formatTime(OPEN_HOUR * 60)}`;
  }
}
updateOpenStatus();
setInterval(updateOpenStatus, 60000);   // re-check every minute
