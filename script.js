// --- FILE UPLOAD & CONVERT LOGIC ---
const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const status = document.getElementById("status");

let selectedFile = null;

// Mobile device pe sirf tap (no weird drag events), Desktop pe drag & drop + tap
const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
if (isTouch) {
  uploadBox.addEventListener("click", () => fileInput.click());
} else {
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

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.name.endsWith(".mrpack")) {
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
  setStatus("⏳ Converting...", true);

  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    // JSZip loaded from CDN in index.html
    const zip = await JSZip.loadAsync(arrayBuffer);
    const newZip = new JSZip();

    // Copy all files from mrpack to new ZIP
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

// --- FAQ ACCORDION ---
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function () {
    const faqItem = btn.parentElement;
    faqItem.classList.toggle('active');
  });
});
