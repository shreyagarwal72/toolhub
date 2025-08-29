function showTool(tool) {
  const content = document.getElementById("content-area");

  if (tool === "home") {
    content.innerHTML = `
      <h2>Home</h2>
      <p>Welcome to Nextup Tools. Select a tool from the sidebar to begin.</p>
    `;
  }

  if (tool === "wordCounter") {
    content.innerHTML = `
      <h2>Word Counter</h2>
      <textarea id="textInput" placeholder="Type or paste your text here..." rows="8" style="width:100%; padding:10px; border-radius:8px; border:none; outline:none; background:#2a2a2a; color:#fff;"></textarea>
      <button onclick="countWords()" style="margin-top:10px; padding:10px 20px; border:none; border-radius:8px; background:#00bcd4; color:#121212; font-weight:bold; cursor:pointer;">Count</button>
      <div id="result" style="margin-top:15px; font-size:1.1em;"></div>
    `;
  }
}

function countWords() {
  const text = document.getElementById("textInput").value.trim();
  const wordCount = text === "" ? 0 : text.split(/\s+/).length;
  const charCount = text.length;
  
  document.getElementById("result").innerHTML = `
    <p><strong>Words:</strong> ${wordCount}</p>
    <p><strong>Characters:</strong> ${charCount}</p>
  `;
}