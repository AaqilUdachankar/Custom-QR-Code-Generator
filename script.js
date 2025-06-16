// script.js

let qrType = "url";
let selectedLogoTemplate = "";
let uploadedLogoImage = null;
let lastQRImg = null;

const navButtons = document.querySelectorAll("nav button");
const singleInputDiv = document.getElementById("single-input");
const multiInputDiv = document.getElementById("multi-input");
const qrContentInput = document.getElementById("qr-content");
const multiUrls = document.getElementById("multi-urls");
const multiPhones = document.getElementById("multi-phones");
const multiEmails = document.getElementById("multi-emails");
const fgColorInput = document.getElementById("foreground-color");
const bgColorInput = document.getElementById("background-color");
const fgColorValue = document.getElementById("foreground-color-value");
const bgColorValue = document.getElementById("background-color-value");
const logoSizeInput = document.getElementById("logo-size");
const logoSizeLabel = document.getElementById("logo-size-label");
const styleTemplateSelect = document.getElementById("style-template");
const logoTemplatesDiv = document.getElementById("logo-templates");
const logoUploadInput = document.getElementById("logo-upload");
const logoPreviewImg = document.getElementById("logo-preview");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrCanvas = document.getElementById("qr-canvas");
const ctx = qrCanvas.getContext("2d");

// Initialize nav buttons
navButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    setQRType(e.target.dataset.type, e.target);
  });
});

// Set initial active button and UI state
function setQRType(type, clickedButton) {
  qrType = type;

  // Highlight active button
  navButtons.forEach(btn => btn.classList.remove("active"));
  if (clickedButton) clickedButton.classList.add("active");

  // Show/hide inputs
  if (type === "multi") {
    singleInputDiv.classList.add("hidden");
    multiInputDiv.classList.remove("hidden");
  } else {
    singleInputDiv.classList.remove("hidden");
    multiInputDiv.classList.add("hidden");
  }

  // Change placeholder for single input
  const placeholder = {
    url: "Enter URL...",
    text: "Enter text...",
    phone: "Enter phone number...",
    email: "Enter email...",
    sms: "Enter SMS content...",
    multi: ""
  }[type] || "";

  qrContentInput.placeholder = placeholder;

  loadLogoTemplates(type);
  clearLogoSelection();
  clearLogoPreview();
  clearQRCode();
  lastQRImg = null;
}

// Load logo templates dynamically (demo logos)
function loadLogoTemplates(type) {
  logoTemplatesDiv.innerHTML = "";

  // Demo logos (update paths as needed)
  const logos = [
    {name: "Facebook", src: "logos/facebook.png"},
    {name: "Instagram", src: "logos/instagram.png"},
    {name: "Twitter", src: "logos/twitter.png"},
    {name: "YouTube", src: "logos/youtube.png"},
    {name: "LinkedIn", src: "logos/linkedin.png"},
    {name: "WhatsApp", src: "logos/whatsapp.png"},
    {name: "Telegram", src: "logos/telegram.png"},
    {name: "SMS", src: "logos/sms.png"}
  ];

  logos.forEach(logo => {
    const img = document.createElement("img");
    img.src = logo.src;
    img.alt = logo.name;
    img.title = logo.name;
    img.addEventListener("click", () => {
      selectLogo(logo.src, img);
    });
    logoTemplatesDiv.appendChild(img);
  });
}

// Select a logo template
function selectLogo(src, imgElement) {
  selectedLogoTemplate = src;
  uploadedLogoImage = null;
  logoUploadInput.value = "";
  logoPreviewImg.classList.add("hidden");

  // Highlight selected
  logoTemplatesDiv.querySelectorAll("img").forEach(img => img.classList.remove("active"));
  imgElement.classList.add("active");

  updateLogoPreview();
}

// Clear logo selection
function clearLogoSelection() {
  selectedLogoTemplate = "";
  logoTemplatesDiv.querySelectorAll("img").forEach(img => img.classList.remove("active"));
}

// Clear logo preview image
function clearLogoPreview() {
  logoPreviewImg.src = "";
  logoPreviewImg.classList.add("hidden");
}

// Clear QR canvas
function clearQRCode() {
  ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
}

// Upload logo file handler
logoUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedLogoImage = new Image();
    uploadedLogoImage.onload = () => {
      updateLogoPreview();
    };
    uploadedLogoImage.src = ev.target.result;
    selectedLogoTemplate = "";
    clearLogoSelection();
  };
  reader.readAsDataURL(file);
});

// Update logo preview size on slider input
logoSizeInput.addEventListener("input", () => {
  logoSizeLabel.textContent = `${logoSizeInput.value}%`;
  updateLogoPreview();
  drawLogoOnQR();
});

// Update color value displays
fgColorInput.addEventListener("input", () => {
  fgColorValue.textContent = fgColorInput.value;
});
bgColorInput.addEventListener("input", () => {
  bgColorValue.textContent = bgColorInput.value;
});

// Update logo preview image size and show it
function updateLogoPreview() {
  if (uploadedLogoImage) {
    logoPreviewImg.src = uploadedLogoImage.src;
    logoPreviewImg.classList.remove("hidden");
    const sizePercent = logoSizeInput.value;
    const sizePx = Math.min(100, (256 * sizePercent) / 100);
    logoPreviewImg.style.width = sizePx + "px";
    logoPreviewImg.style.height = sizePx + "px";
  } else if (selectedLogoTemplate) {
    logoPreviewImg.src = selectedLogoTemplate;
    logoPreviewImg.classList.remove("hidden");
    const sizePercent = logoSizeInput.value;
    const sizePx = Math.min(100, (256 * sizePercent) / 100);
    logoPreviewImg.style.width = sizePx + "px";
    logoPreviewImg.style.height = sizePx + "px";
  } else {
    clearLogoPreview();
  }
}

// Generate QR code and draw logo on canvas
function generateQR() {
  let content = "";

  if (qrType === "multi") {
    const urls = multiUrls.value.split(",").map(s => s.trim()).filter(Boolean);
    const phones = multiPhones.value.split(",").map(s => s.trim()).filter(Boolean);
    const emails = multiEmails.value.split(",").map(s => s.trim()).filter(Boolean);
    content = `Links:\n${urls.join("\n")}\nPhones:\n${phones.join("\n")}\nEmails:\n${emails.join("\n")}`;
  } else {
    content = qrContentInput.value.trim();
  }

  if (!content) {
    alert("Please enter content to generate QR code.");
    return;
  }

  clearQRCode();

  // Generate QR using qrcode.js
  const tempDiv = document.createElement("div");
  const qr = new QRCode(tempDiv, {
    text: content,
    width: 256,
    height: 256,
    colorDark: fgColorInput.value,
    colorLight: bgColorInput.value,
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    const qrImg = tempDiv.querySelector("img");
    if (!qrImg) {
      alert("Failed to generate QR code.");
      return;
    }

    qrImg.onload = () => {
      lastQRImg = new Image();
      lastQRImg.onload = () => {
        drawLogoOnQR();
      };
      lastQRImg.src = qrImg.src;
    };

    qrImg.src = qrImg.src; // trigger onload
  }, 100);
}

// Draw QR code and logo on canvas
function drawLogoOnQR() {
  ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
  if (lastQRImg) ctx.drawImage(lastQRImg, 0, 0, 256, 256);

  // Draw logo if any
  let logo = null;
  if (uploadedLogoImage) logo = uploadedLogoImage;
  else if (selectedLogoTemplate) {
    logo = new Image();
    logo.src = selectedLogoTemplate;
  }
  if (logo) {
    const size = (qrCanvas.width * logoSizeInput.value) / 100;
    const x = (qrCanvas.width - size) / 2;
    const y = (qrCanvas.height - size) / 2;

    // If logo is already loaded, draw immediately, else wait for load
    if (logo.complete) {
      ctx.drawImage(logo, x, y, size, size);
    } else {
      logo.onload = () => ctx.drawImage(logo, x, y, size, size);
    }
  }
}

// Download QR canvas as PNG
function downloadQR() {
  const link = document.createElement("a");
  link.href = qrCanvas.toDataURL("image/png");
  link.download = "qr-code.png";
  link.click();
}

// Initial setup on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  setQRType("url", document.querySelector('nav button[data-type="url"]'));
  updateLogoPreview();
});

// Button event listeners
generateBtn.addEventListener("click", generateQR);
downloadBtn.addEventListener("click", downloadQR);
