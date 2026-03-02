/* ================================================================
   QR Code Generator – app.js
   Pure client-side, no server calls. Uses Nayuki qrcodegen library.
   ================================================================ */

// ── Localisation strings ───────────────────────
const i18n = {
  en: {
    title: "QR Code Generator",
    urlLabel: "Enter URL",
    urlError: "Please enter a valid URL (must start with http:// or https://)",
    hint: "💡 Tip: A shorter URL produces a smaller, easier-to-scan QR code.",
    ecLabel: "Error Correction",
    generate: "Generate QR Code",
    downloadSvg: "Download SVG",
    downloadPng: "Download PNG",
    footer:
      "Free & open-source — runs entirely in your browser. No data is sent to any server.",
    ecL: "L – Low (7%)",
    ecM: "M – Medium (15%)",
    ecQ: "Q – Quartile (25%)",
    ecH: "H – High (30%)",
  },
  sv: {
    title: "QR-kodgenerator",
    urlLabel: "Ange URL",
    urlError: "Ange en giltig URL (måste börja med http:// eller https://)",
    hint: "💡 Tips: En kortare URL ger en mindre och lättare skannad QR-kod.",
    ecLabel: "Felkorrigering",
    generate: "Skapa QR-kod",
    downloadSvg: "Ladda ner SVG",
    downloadPng: "Ladda ner PNG",
    footer:
      "Gratis & öppen källkod — körs helt i din webbläsare. Ingen data skickas till någon server.",
    ecL: "L – Låg (7 %)",
    ecM: "M – Medel (15 %)",
    ecQ: "Q – Kvartil (25 %)",
    ecH: "H – Hög (30 %)",
  },
};

let currentLang = "en";

// ── DOM references ─────────────────────────────
const urlInput = document.getElementById("url-input");
const urlError = document.getElementById("url-error");
const ecSelect = document.getElementById("ec-level");
const generateBtn = document.getElementById("generate-btn");
const outputSection = document.getElementById("output-section");
const qrCanvas = document.getElementById("qr-canvas");
const downloadSvgBtn = document.getElementById("download-svg");
const downloadPngBtn = document.getElementById("download-png");
const langEnBtn = document.getElementById("lang-en");
const langSvBtn = document.getElementById("lang-sv");

// Use UTF-8 encoding for QR content
qrcode.stringToBytesFuncs["UTF-8"];
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

// Currently generated SVG string (kept for download)
let currentSvgString = "";

// ── Localisation helpers ───────────────────────
function applyLanguage(lang) {
  currentLang = lang;
  const strings = i18n[lang];

  // Text content for elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) {
      el.textContent = strings[key];
    }
  });

  // Update select options
  const ecOptions = ecSelect.querySelectorAll("option");
  const ecKeys = ["ecL", "ecM", "ecQ", "ecH"];
  ecOptions.forEach((opt, idx) => {
    opt.textContent = strings[ecKeys[idx]];
  });

  // Update page title
  document.title = strings.title;

  // Active state on buttons
  langEnBtn.classList.toggle("active", lang === "en");
  langSvBtn.classList.toggle("active", lang === "sv");

  // Persist preference
  try {
    localStorage.setItem("qrgen-lang", lang);
  } catch (_) {
    /* ignore */
  }
}

// ── URL validation ─────────────────────────────
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function showError() {
  urlInput.classList.add("invalid");
  urlError.hidden = false;
}

function hideError() {
  urlInput.classList.remove("invalid");
  urlError.hidden = true;
}

// ── QR Generation ──────────────────────────────

function generateQr() {
  const url = urlInput.value.trim();

  if (!isValidUrl(url)) {
    showError();
    outputSection.hidden = true;
    return;
  }
  hideError();

  const ecLevel = ecSelect.value; // 'L', 'M', 'Q', or 'H'

  // typeNumber 0 = auto-detect smallest version that fits
  const qr = qrcode(0, ecLevel);
  qr.addData(url);
  qr.make();

  // Build SVG manually for clean download
  const moduleCount = qr.getModuleCount();
  const border = 2;
  const size = moduleCount + border * 2;
  let parts = [];
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (qr.isDark(y, x)) {
        parts.push(`M${x + border},${y + border}h1v1h-1z`);
      }
    }
  }

  const svgStr = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
    `  <rect width="100%" height="100%" fill="#ffffff"/>`,
    `  <path d="${parts.join(" ")}" fill="#000000"/>`,
    `</svg>`,
  ].join("\n");

  currentSvgString = svgStr;
  qrCanvas.innerHTML = svgStr;
  outputSection.hidden = false;
}

// ── Download helpers ───────────────────────────
function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 100);
}

function downloadSvg() {
  if (!currentSvgString) return;
  const blob = new Blob([currentSvgString], { type: "image/svg+xml" });
  downloadBlob(blob, "qrcode.svg");
}

function downloadPng() {
  if (!currentSvgString) return;

  const svgBlob = new Blob([currentSvgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    const pngSize = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = pngSize;
    canvas.height = pngSize;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pngSize, pngSize);

    // Draw QR
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, pngSize, pngSize);

    canvas.toBlob((blob) => {
      downloadBlob(blob, "qrcode.png");
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  img.src = url;
}

// ── Event listeners ────────────────────────────
generateBtn.addEventListener("click", generateQr);

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateQr();
});

urlInput.addEventListener("input", () => {
  if (!urlError.hidden) hideError();
});

downloadSvgBtn.addEventListener("click", downloadSvg);
downloadPngBtn.addEventListener("click", downloadPng);

langEnBtn.addEventListener("click", () => applyLanguage("en"));
langSvBtn.addEventListener("click", () => applyLanguage("sv"));

// ── Init ───────────────────────────────────────
(function init() {
  // Restore language preference
  let savedLang;
  try {
    savedLang = localStorage.getItem("qrgen-lang");
  } catch (_) {
    /* ignore */
  }

  // Detect browser language as fallback
  if (!savedLang) {
    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    savedLang = browserLang === "sv" ? "sv" : "en";
  }

  applyLanguage(savedLang);
})();
