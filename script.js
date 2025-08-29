function showTool(tool) {
  const content = document.getElementById("content-area");

  if (tool === "home") {
    content.innerHTML = `
      <h2>Home</h2>
      <p>Welcome to <b>HandyBox</b> 🎉 Your one-stop utility hub.</p>
    `;
  }

  // Word Counter
  if (tool === "wordCounter") {
    content.innerHTML = `
      <h2>📝 Word Counter</h2>
      <textarea id="textInput" placeholder="Type or paste your text here..." rows="8"></textarea>
      <button onclick="countWords()">Count</button>
      <div id="result"></div>
    `;
  }

  // Password Generator
  if (tool === "passwordGen") {
    content.innerHTML = `
      <h2>🔑 Password Generator</h2>
      <label>Length:</label>
      <input type="number" id="passLength" value="12" min="4" max="50">
      <button onclick="generatePassword()">Generate</button>
      <div id="passwordResult"></div>
    `;
  }

  // QR Code Generator
  if (tool === "qrCode") {
    content.innerHTML = `
      <h2>📷 QR Code Generator</h2>
      <input type="text" id="qrText" placeholder="Enter text or URL">
      <button onclick="generateQR()">Generate QR</button>
      <div id="qrResult" style="margin-top:15px;"></div>
    `;
  }

  // Case Converter
  if (tool === "caseConverter") {
    content.innerHTML = `
      <h2>🔤 Case Converter</h2>
      <textarea id="caseText" placeholder="Type text here..." rows="6"></textarea>
      <button onclick="convertCase('upper')">UPPERCASE</button>
      <button onclick="convertCase('lower')">lowercase</button>
      <button onclick="convertCase('title')">Title Case</button>
      <div id="caseResult" style="margin-top:15px;"></div>
    `;
  }
}

// Word Counter Logic
function countWords() {
  const text = document.getElementById("textInput").value.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  const chars = text.length;
  document.getElementById("result").innerHTML = `<p><b>Words:</b> ${words}</p><p><b>Characters:</b> ${chars}</p>`;
}

// Password Generator
function generatePassword() {
  const length = document.getElementById("passLength").value;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("passwordResult").innerHTML = `<p><b>Password:</b> ${password}</p>`;
}

// QR Generator (using free API)
function generateQR() {
  const text = document.getElementById("qrText").value;
  if (!text) return alert("Enter text or URL!");
  document.getElementById("qrResult").innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}">`;
}

// Case Converter
function convertCase(type) {
  let text = document.getElementById("caseText").value;
  if (type === "upper") text = text.toUpperCase();
  if (type === "lower") text = text.toLowerCase();
  if (type === "title") text = text.replace(/\w\S*/g, w => w[0].toUpperCase() + w.substring(1).toLowerCase());
  document.getElementById("caseResult").innerHTML = `<p><b>Result:</b> ${text}</p>`;
}