// Elements reference
const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const uploadBox = document.querySelector('.upload-box');

// Drag & Drop mobile detection
const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// State
let selectedFile = null;

// Mobile: Only allow tap to open file chooser
if (isTouch) {
  uploadBox.style.cursor = "pointer";
  uploadBox.addEventListener("click", () => fileInput.click());
} else {
  // Desktop: drag & drop + click
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("dragover");
  });
  uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("dragover");
  });
  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
  uploadBox.addEventListener("click", () => fileInput.click());
}

// Always: File selection handler
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file || !file.name.endsWith(".mrpack")) {
    showStatus("❌ Please select a .mrpack file", false);
    convertBtn.disabled = true;
    downloadLink.style.display = "none";
    selectedFile = null;
    return;
  }
  selectedFile = file;
  showStatus(`✅ Selected: ${file.name}`, true);
  convertBtn.disabled = false;
  downloadLink.style.display = "none";
}

function showStatus(msg, ok) {
  let status = document.getElementById("status");
  if (!status) {
    status = document.createElement("div");
    status.id = "status";
    status.style.margin = "12px 0";
    status.style.textAlign = "center";
    document.querySelector(".upload-box").appendChild(status);
  }
  status.textContent = msg;
  status.style.color = ok ? "#31da5a" : "#FFA831";
}

// Conversion logic (demo: actual JSZip/worker logic yahan lagayein)
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return showStatus("❌ No .mrpack file selected", false);
  showStatus("⏳ Converting...", true);
  convertBtn.disabled = true;

  // Simulated conversion & download (replace this block with real logic)
  setTimeout(() => {
    const blob = new Blob(["This would be your real .zip content"], { type: "application/zip" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = selectedFile.name.replace(".mrpack", ".zip");
    downloadLink.textContent = "Download Converted File";
    downloadLink.style.display = "inline-block";
    showStatus("✅ Conversion Complete! Tap 'Download Converted File' below.", true);
    convertBtn.disabled = false;
  }, 1500);
});
