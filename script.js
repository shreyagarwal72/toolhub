// --- FILE UPLOAD & CONVERT LOGIC ---
const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const status = document.getElementById("status");

let selectedFile = null;

// --- Click to open file picker everywhere ---
uploadBox.addEventListener("click", function(e) {
  // Prevent double event if input is clicked
  if (e.target !== fileInput) {
    fileInput.click();
  }
});
fileInput.addEventListener("click", function(e) { e.stopPropagation(); });

// --- Drag & drop (desktop) ---
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
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// --- File selection change handler ---
fileInput.addEventListener("change", (e) => {
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

// --- Conversion logic (uses JSZip, CDN included in index.html) ---
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return setStatus("❌ No .mrpack file selected", false);
  convertBtn.disabled = true;
  setStatus("⏳ Converting...", true);

  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    // JSZip from CDN required (add <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script> in HTML)
    const zip = await JSZip.loadAsync(arrayBuffer);
    const newZip = new JSZip();

    await Promise.all(Object.values(zip.files).map(async file => {
      if (!file.dir) {
        const content = await file.async("uint8array");
        newZip.file(file.name, content);
      }
    }));

    const outBlob = await newZip.generateAsync({ type: "blob" });
    downloadLink.href = URL.createObjectURL(outBlob);
    downloadLink.download = selectedFile.name.replace(/\.mrpack$/i, ".zip");
    downloadLink.textContent = "Download Converted File";
    downloadLink.style.display = "inline-block";
    setStatus("✅ Conversion Complete! Tap 'Download Converted File'.", true);
  } catch (err) {
    setStatus("❌ Error: File is not a valid .mrpack archive.", false);
  }
  convertBtn.disabled = false;
});
