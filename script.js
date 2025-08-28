const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("drop-area");
const convertBtn = document.getElementById("convertBtn");
const status = document.getElementById("status");
let selectedFile = null;

// Drag & Drop highlight
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.name.endsWith(".mrpack")) {
    status.innerText = "❌ Please select a .mrpack file";
    convertBtn.disabled = true;
    return;
  }
  selectedFile = file;
  status.innerText = `✅ Selected: ${file.name}`;
  convertBtn.disabled = false;
}

// Convert to ZIP
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  status.innerText = "⏳ Converting...";

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = e.target.result;
      const zip = await JSZip.loadAsync(data);
      const newZip = new JSZip();

      // Copy all files into new ZIP
      for (const [filename, fileData] of Object.entries(zip.files)) {
        if (!fileData.dir) {
          const content = await fileData.async("arraybuffer");
          newZip.file(filename, content);
        }
      }

      const content = await newZip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = selectedFile.name.replace(".mrpack", ".zip");
      downloadLink.click();

      status.innerText = "✅ Conversion Complete! File downloaded.";
    } catch (err) {
      console.error(err);
      status.innerText = "❌ Error converting file.";
    }
  };
  reader.readAsArrayBuffer(selectedFile);
});