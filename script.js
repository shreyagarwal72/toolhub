const BACKEND_URL = "http://192.168.31.72:3000/convert"; // <-- apne WiFi IP ko yahin rakho

const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const status = document.getElementById("status");

let selectedFile = null;

// Click to open file picker
uploadBox.addEventListener("click", function(e) {
  if (e.target !== fileInput) fileInput.click();
});
fileInput.addEventListener("click", e => e.stopPropagation());

// Drag & drop (desktop)
uploadBox.addEventListener("dragover", e => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});
uploadBox.addEventListener("drop", e => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", e => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file || !file.name.endsWith(".mrpack")) {
    setStatus("❌ Please select a .mrpack file", false);
    convertBtn.disabled = true;
    selectedFile = null;
    downloadLink.style.display = "none";
    return;
  }
  selectedFile = file;
  setStatus(`✅ Selected: ${file.name}`, true);
  convertBtn.disabled = false;
  downloadLink.style.display = "none";
}

function setStatus(msg, success) {
  status.textContent = msg;
  status.style.color = success ? "#32a852" : "#ffa831";
}

convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return setStatus("❌ No .mrpack file selected", false);
  convertBtn.disabled = true;
  setStatus("⏳ Uploading & Converting...", true);

  try {
    const formData = new FormData();
    formData.append("mrpack", selectedFile);

    const resp = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData
    });

    if (!resp.ok) {
      setStatus("❌ Server error or no response!", false);
      convertBtn.disabled = false;
      return;
    }

    const blob = await resp.blob();
    if (blob.size < 100) {
      setStatus("❌ Received empty or invalid ZIP!", false);
      convertBtn.disabled = false;
      return;
    }

    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = selectedFile.name.replace(/\.mrpack$/i, ".zip");
    downloadLink.textContent = "Download Converted File";
    downloadLink.style.display = "inline-block";
    setStatus("✅ Conversion complete! Download your ZIP.", true);
  } catch (err) {
    setStatus("❌ Network/server error: " + err, false);
  }
  convertBtn.disabled = false;
});
