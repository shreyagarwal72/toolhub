// ----------------------------
// WORD COUNTER
// ----------------------------
function countWords() {
  const text = document.getElementById('wordText').value.trim();
  if(!text) {
    alert('Please enter some text to count!');
    return;
  }
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  document.getElementById('wordResult').innerText = `Words: ${words} | Characters: ${chars}`;
}

// ----------------------------
// PASSWORD GENERATOR
// ----------------------------
function generatePassword() {
  const length = 12; // default length
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  document.getElementById('passwordResult').innerText = password;
}

// ----------------------------
// QR GENERATOR
// ----------------------------
function generateQR() {
  const text = document.getElementById('qrText').value.trim();
  if(!text) {
    alert('Please enter text or URL to generate QR!');
    return;
  }
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  document.getElementById('qrResult').innerHTML = `<img src="${qrUrl}" alt="QR Code" style="border-radius:12px;">`;
}

// ----------------------------
// CASE CONVERTER
// ----------------------------
function convertCase(type) {
  const text = document.getElementById('caseText').value.trim();
  if(!text) {
    alert('Please enter some text to convert!');
    return;
  }
  let result = '';
  if(type === 'upper') result = text.toUpperCase();
  if(type === 'lower') result = text.toLowerCase();
  if(type === 'title') result = text.replace(/\w\S*/g, w => w[0].toUpperCase() + w.substring(1).toLowerCase());
  document.getElementById('caseResult').innerText = result;
}

// ----------------------------
// TEXT REVERSER
// ----------------------------
function reverseText() {
  const text = document.getElementById('reverseText').value.trim();
  if (!text) {
    alert('Please enter some text to reverse!');
    return;
  }
  const reversed = text.split('').reverse().join('');
  document.getElementById('reverseResult').innerText = reversed;
}