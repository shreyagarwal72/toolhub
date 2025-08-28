// Switch between tools
function showTool(id) {
  document.querySelectorAll('.tool').forEach(tool => {
    tool.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// File Extension Converter
function convertFile() {
  const fileInput = document.getElementById("fileInput");
  const extension = document.getElementById("extension").value;

  if (!fileInput.files.length) {
    alert("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];
  const newName = file.name.replace(/\.[^/.]+$/, "") + "." + extension;

  const blob = new Blob([file], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = newName;
  link.click();
}