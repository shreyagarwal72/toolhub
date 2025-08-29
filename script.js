// Elements
const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const uploadBox = document.querySelector('.upload-box');

// State
let selectedFile = null;

// Enable convert button only if valid file selected
fileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  handleFile(file);
});

// Drag & drop support
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
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// File handler logic
function handleFile(file) {
  if (!file || !file.name.endsWith(".mrpack")) {
    showStatus("❌ Please select a .mrpack file", false);
    convertBtn.disabled = true;
    selectedFile = null;
    return;
  }
  selectedFile = file;
  showStatus(`✅ Selected: ${file.name}`, true);
  convertBtn.disabled = false;
}

// Status UI updater
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
  status.style.color = ok ? "#31da5a" : "#ffa831";
}

// Convert logic (demo for ZIP, add real logic with JSZip or similar lib)
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return showStatus("❌ No .mrpack file selected", false);

  showStatus("⏳ Converting...", true);
  convertBtn.disabled = true;

  // Simulated conversion and download (REPLACE THIS with actual MRPACK->ZIP code)
  setTimeout(() => {
    const blob = new Blob(["This would be your real .zip content"], { type: "application/zip" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = selectedFile.name.replace(".mrpack", ".zip");
    downloadLink.textContent = "Download Converted File";
    downloadLink.style.display = "inline-block";
    showStatus("✅ Conversion Complete! Click 'Download Converted File' below.", true);
    convertBtn.disabled = false;
  }, 1600);
});

// Optional: clicking the label triggers fileInput
uploadBox.addEventListener("click", () => fileInput.click());
