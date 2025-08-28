const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");

let selectedFile = null;

// Drag & Drop Events
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.borderColor = "#00ff9d";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.borderColor = "rgba(0,245,255,0.6)";
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].name.endsWith(".mrpack")) {
    selectedFile = files[0];
    convertBtn.disabled = false;
    dropArea.querySelector("p").textContent = `Selected: ${selectedFile.name}`;
  } else {
    alert("Please upload a .mrpack file only.");
  }
});

// File Input
fileElem.addEventListener("change", () => {
  if (fileElem.files.length > 0 && fileElem.files[0].name.endsWith(".mrpack")) {
    selectedFile = fileElem.files[0];
    convertBtn.disabled = false;
    dropArea.querySelector("p").textContent = `Selected: ${selectedFile.name}`;
  } else {
    alert("Please upload a .mrpack file only.");
  }
});

// Convert File
convertBtn.addEventListener("click", () => {
  if (!selectedFile) return;

  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressContainer.classList.add("hidden");
        downloadBtn.classList.remove("hidden");
      }, 500);
    }
  }, 300);
});

// Download Converted File
downloadBtn.addEventListener("click", () => {
  if (!selectedFile) return;
  const newName = selectedFile.name.replace(/\.mrpack$/, ".zip");
  const blob = new Blob([selectedFile], { type: "application/zip" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = newName;
  link.click();
});