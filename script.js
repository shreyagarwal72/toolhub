// ===========================
// CUSTOM ALERT FUNCTION
// ===========================
function showAlert(message) {
  const existing = document.getElementById('customAlert');
  if(existing) existing.remove();

  const alertDiv = document.createElement('div');
  alertDiv.id = 'customAlert';
  alertDiv.innerText = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.backgroundColor = '#ff4d4d';
  alertDiv.style.color = '#fff';
  alertDiv.style.padding = '15px 25px';
  alertDiv.style.borderRadius = '10px';
  alertDiv.style.fontWeight = 'bold';
  alertDiv.style.zIndex = '1000';
  alertDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  alertDiv.style.animation = 'fadeOut 4s forwards';

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

// Fade out animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeOut {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}`;
document.head.appendChild(style);

// ===========================
// PASSWORD GENERATOR
// ===========================
function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  const resultDiv = document.getElementById('passwordResult');
  if(resultDiv) resultDiv.innerText = password;
}

// ===========================
// WORD COUNTER
// ===========================
function countWords() {
  const textElem = document.getElementById('wordText');
  if(!textElem) return;
  const text = textElem.value.trim();
  if(!text) {
    showAlert('Please enter some text to count!');
    return;
  }
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  document.getElementById('wordResult').innerText = `Words: ${words} | Characters: ${chars}`;
}

// ===========================
// QR GENERATOR
// ===========================
function generateQR() {
  const qrElem = document.getElementById('qrText');
  if(!qrElem) return;
  const text = qrElem.value.trim();
  if(!text) {
    showAlert('Please enter text or URL to generate QR!');
    return;
  }
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  document.getElementById('qrResult').innerHTML = `<img src="${qrUrl}" alt="QR Code" style="border-radius:12px;">`;
}

// ===========================
// CASE CONVERTER
// ===========================
function convertCase(type) {
  const caseElem = document.getElementById('caseText');
  if(!caseElem) return;
  const text = caseElem.value.trim();
  if(!text) {
    showAlert('Please enter some text to convert!');
    return;
  }
  let result = '';
  if(type === 'upper') result = text.toUpperCase();
  if(type === 'lower') result = text.toLowerCase();
  if(type === 'title') result = text.replace(/\w\S*/g, w => w[0].toUpperCase() + w.substring(1).toLowerCase());
  document.getElementById('caseResult').innerText = result;
}

// ===========================
// TEXT REVERSER
// ===========================
function reverseText() {
  const revElem = document.getElementById('reverseText');
  if(!revElem) return;
  const text = revElem.value.trim();
  if (!text) {
    showAlert('Please enter some text to reverse!');
    return;
  }
  const reversed = text.split('').reverse().join('');
  document.getElementById('reverseResult').innerText = reversed;
}

// ===========================
// AGE CALCULATOR
// ===========================
function calculateAge() {
  const birthElem = document.getElementById('birthDate');
  if(!birthElem) return;
  const birth = birthElem.value;
  if(!birth) {
    showAlert('Please select your birth date!');
    return;
  }
  const birthDate = new Date(birth);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if(days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if(months < 0) {
    years--;
    months += 12;
  }

  document.getElementById('ageResult').innerText = `You are ${years} years, ${months} months, and ${days} days old.`;
}

// ===========================
// UNIT CONVERTER
// ===========================
const units = {
  length: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
  weight: ['Gram', 'Kilogram', 'Milligram', 'Pound', 'Ounce'],
  temperature: ['Celsius', 'Fahrenheit', 'Kelvin']
};

function updateUnits() {
  const typeElem = document.getElementById('unitType');
  if(!typeElem) return;
  const type = typeElem.value;
  const from = document.getElementById('unitFrom');
  const to = document.getElementById('unitTo');
  if(!from || !to) return;

  from.innerHTML = '';
  to.innerHTML = '';
  units[type].forEach(u => {
    const option1 = document.createElement('option');
    option1.value = u; option1.innerText = u;
    const option2 = document.createElement('option');
    option2.value = u; option2.innerText = u;
    from.appendChild(option1);
    to.appendChild(option2);
  });
}

function convertUnit() {
  const typeElem = document.getElementById('unitType');
  const fromElem = document.getElementById('unitFrom');
  const toElem = document.getElementById('unitTo');
  const inputElem = document.getElementById('unitInput');
  if(!typeElem || !fromElem || !toElem || !inputElem) return;

  const type = typeElem.value;
  const from = fromElem.value;
  const to = toElem.value;
  const value = parseFloat(inputElem.value);
  if(isNaN(value)) {
    showAlert('Please enter a valid number!');
    return;
  }
  let result = value;

  // LENGTH conversion
  if(type === 'length') {
    const toMeter = {
      Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001,
      Mile:1609.34, Yard:0.9144, Foot:0.3048, Inch:0.0254
    };
    result = value * toMeter[from] / toMeter[to];
  }

  // WEIGHT conversion
  if(type === 'weight') {
    const toGram = {
      Gram:1, Kilogram:1000, Milligram:0.001, Pound:453.592, Ounce:28.3495
    };
    result = value * toGram[from] / toGram[to];
  }

  // TEMPERATURE conversion
  if(type === 'temperature') {
    if(from === to) result = value;
    else if(from === 'Celsius') {
      if(to==='Fahrenheit') result = (value*9/5)+32;
      if(to==='Kelvin') result = value + 273.15;
    } else if(from==='Fahrenheit') {
      if(to==='Celsius') result = (value-32)*5/9;
      if(to==='Kelvin') result = (value-32)*5/9 + 273.15;
    } else if(from==='Kelvin') {
      if(to==='Celsius') result = value - 273.15;
      if(to==='Fahrenheit') result = (value-273.15)*9/5 + 32;
    }
  }

  document.getElementById('unitResult').innerText = `${value} ${from} = ${result.toFixed(4)} ${to}`;
}

// Initialize units dropdown on page load
window.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('unitType')) updateUnits();
});