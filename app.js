// Basic state + wiring
const sliders = Array.from(document.querySelectorAll('.slider'));
const labels = Array.from(document.querySelectorAll('.value-label span[contenteditable]'));
const resultsList = document.getElementById('resultsList');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

function readState(){
  return sliders.map((sl, i) => ({
    name: labels[i].innerText.trim() || labels[i].dataset.placeholder || `Value ${i+1}`,
    score: parseInt(sl.value, 10)
  }));
}

function render(){
  const state = readState();
  resultsList.innerHTML = '';
  state.forEach(({name, score}) => {
    const li = document.createElement('li');
    const pos = score < 0 ? 'Underplayed' : score > 0 ? 'Overplayed' : 'Balanced';
    li.innerHTML = `<strong>${name}</strong><span>${score} (${pos})</span>`;
    resultsList.appendChild(li);
  });

  // prepare downloadable JSON
  const dataStr = JSON.stringify({values: readState()}, null, 2);
  const blob = new Blob([dataStr], {type:'application/json'});
  downloadBtn.href = URL.createObjectURL(blob);
}

sliders.forEach(sl => sl.addEventListener('input', render));
labels.forEach(l => l.addEventListener('input', render));
resetBtn.addEventListener('click', () => {
  sliders.forEach(sl => sl.value = 0);
  render();
});
copyBtn.addEventListener('click', async () => {
  const dataStr = JSON.stringify({values: readState()}, null, 2);
  try{
    await navigator.clipboard.writeText(dataStr);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy JSON', 1200);
  }catch(e){
    alert('Copy failed. You can use the Download JSON link instead.');
  }
});

render();
