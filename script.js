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

navButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    setQRType(e.target.dataset.type, e.target);
  });
});

function setQRType(type, clickedButton) {
  qrType = type;

  navButtons.forEach(btn => btn.classList.remove("active"));
  if (clickedButton) clickedButton.classList.add("active");

  if (type === "multi") {
    singleInputDiv.classList.add("hidden");
    multiInputDiv.classList.remove("hidden");
  } else {
    singleInputDiv.classList.remove("hidden");
    multiInputDiv.classList.add("hidden");
  }

  const placeholder = {
    url: "Enter URL...",
    text: "Enter text...",
    phone: "Enter phone number...",
    email: "Enter email address...",
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

function loadLogoTemplates(type) {
  logoTemplatesDiv.innerHTML = "";

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

function selectLogo(src, imgElement) {
  selectedLogoTemplate = src;
  uploadedLogoImage = null;
  logoUploadInput.value = "";
  logoPreviewImg.classList.add("hidden");

  logoTemplatesDiv.querySelectorAll("img").forEach(img => img.classList.remove("active"));
  imgElement.classList.add("active");

  updateLogoPreview();
}

function clearLogoSelection() {
  selectedLogoTemplate = "";
  logoTemplatesDiv.querySelectorAll("img").forEach(img => img.classList.remove("active"));
}

function clearLogoPreview() {
  logoPreviewImg.src = "";
  logoPreviewImg.classList.add("hidden");
}

function clearQRCode() {
  ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
}

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

logoSizeInput.addEventListener("input", () => {
  logoSizeLabel.textContent = `${logoSizeInput.value}%`;
  updateLogoPreview();
  drawLogoOnQR();
});

fgColorInput.addEventListener("input", () => {
  fgColorValue.textContent = fgColorInput.value;
});
bgColorInput.addEventListener("input", () => {
  bgColorValue.textContent = bgColorInput.value;
});

function updateLogoPreview() {
  const sizePercent = logoSizeInput.value;
  const sizePx = Math.min(100, (256 * sizePercent) / 100);

  if (uploadedLogoImage) {
    logoPreviewImg.src = uploadedLogoImage.src;
    logoPreviewImg.classList.remove("hidden");
    logoPreviewImg.style.width = sizePx + "px";
    logoPreviewImg.style.height = sizePx + "px";
  } else if (selectedLogoTemplate) {
    logoPreviewImg.src = selectedLogoTemplate;
    logoPreviewImg.classList.remove("hidden");
    logoPreviewImg.style.width = sizePx + "px";
    logoPreviewImg.style.height = sizePx + "px";
  } else {
    clearLogoPreview();
  }
}

function generateQR() {
  let content = "";

  if (qrType === "multi") {
    const urls = multiUrls.value.split(",").map(s => s.trim()).filter(Boolean);
    const phones = multiPhones.value.split(",").map(s => s.trim()).filter(Boolean);
    const emails = multiEmails.value.split(",").map(s => s.trim()).filter(Boolean);
    content = `Links:\n${urls.join("\n")}\nPhones:\n${phones.join("\n")}\nEmails:\n${emails.join("\n")}`;
  } else {
    const raw = qrContentInput.value.trim();
    if (!raw) {
      alert("Please enter content to generate QR code.");
      return;
    }

    switch (qrType) {
      case "url":
        content = raw;
        break;
      case "text":
        content = raw;
        break;
      case "phone":
        content = `tel:${raw}`;
        break;
      case "email":
        content = `mailto:${raw}`;
        break;
      case "sms":
        content = `sms:${raw}`;
        break;
      default:
        content = raw;
    }
  }

  clearQRCode();

  const tempDiv = document.createElement("div");
  new QRCode(tempDiv, {
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
    qrImg.src = qrImg.src;
  }, 100);
}

function drawLogoOnQR() {
  ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
  if (lastQRImg) ctx.drawImage(lastQRImg, 0, 0, 256, 256);

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

    if (logo.complete) {
      ctx.drawImage(logo, x, y, size, size);
    } else {
      logo.onload = () => ctx.drawImage(logo, x, y, size, size);
    }
  }
}

function downloadQR() {
  const link = document.createElement("a");
  link.href = qrCanvas.toDataURL("image/png");
  link.download = "qr-code.png";
  link.click();
}

window.addEventListener("DOMContentLoaded", () => {
  setQRType("url", document.querySelector('nav button[data-type="url"]'));
  updateLogoPreview();
});

generateBtn.addEventListener("click", generateQR);
downloadBtn.addEventListener("click", downloadQR);
