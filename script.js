// ── State ──────────────────────────────────────────────────
let currentInput   = '0';
let previousInput  = '';
let operator       = null;
let shouldReset    = false;
let memory         = 0;
const DECIMAL_PLACES = 2;

// ── DOM References ─────────────────────────────────────────
const displayEl   = document.getElementById('display');
const secondaryEl = document.getElementById('secondary');

// ── Update Display ─────────────────────────────────────────
function updateDisplay() {
  displayEl.textContent = currentInput;

  if (operator && previousInput !== '') {
    secondaryEl.textContent = `${previousInput} ${operatorSymbol(operator)}`;
  } else {
    secondaryEl.textContent = '0';
  }
}

function operatorSymbol(op) {
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op] || op;
}

// ── Number Entry ───────────────────────────────────────────
function appendNum(num) {
  if (shouldReset) {
    currentInput = num;
    shouldReset  = false;
  } else {
    if (currentInput === '0' && num !== '.') {
      currentInput = num;
    } else {
      if (currentInput.length >= 15) return; // limit digits
      currentInput += num;
    }
  }
  updateDisplay();
}

function appendDot() {
  if (shouldReset) {
    currentInput = '0.';
    shouldReset  = false;
    updateDisplay();
    return;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay();
  }
}

// ── Operators ──────────────────────────────────────────────
function setOperator(op) {
  if (operator && !shouldReset) {
    // chain calculation
    calculate(true);
  }
  previousInput = currentInput;
  operator      = op;
  shouldReset   = true;
  updateDisplay();
}

function calculate(chaining = false) {
  if (!operator || previousInput === '') return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  let result;

  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) { currentInput = 'Error'; operator = null; previousInput = ''; updateDisplay(); return; }
      result = prev / curr;
      break;
    default: return;
  }

  // Round to DECIMAL_PLACES but trim trailing zeros
  currentInput = formatResult(result);

  if (!chaining) {
    operator      = null;
    previousInput = '';
  }
  shouldReset = true;
  updateDisplay();
}

function formatResult(val) {
  if (!isFinite(val)) return 'Error';
  // Round to 10 decimal places to avoid floating-point artefacts
  let rounded = Math.round(val * 1e10) / 1e10;
  // Display with up to DECIMAL_PLACES decimals, stripping trailing zeros
  let str = rounded.toFixed(DECIMAL_PLACES);
  // Remove unnecessary trailing zeros after decimal
  str = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return str;
}

// ── Clear & Backspace ──────────────────────────────────────
function clearAll() {
  currentInput  = '0';
  previousInput = '';
  operator      = null;
  shouldReset   = false;
  updateDisplay();
}

function backspace() {
  if (shouldReset || currentInput === 'Error') {
    currentInput = '0';
    shouldReset  = false;
  } else if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  if (currentInput.startsWith('-')) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = '-' + currentInput;
  }
  updateDisplay();
}

// ── Memory ─────────────────────────────────────────────────
function memClear()  { memory = 0; }
function memRecall() { currentInput = formatResult(memory); shouldReset = false; updateDisplay(); }
function memPlus()   { memory += parseFloat(currentInput) || 0; }
function memMinus()  { memory -= parseFloat(currentInput) || 0; }

// ── Keyboard Support ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9')  appendNum(e.key);
  else if (e.key === '.')            appendDot();
  else if (e.key === '+')            setOperator('+');
  else if (e.key === '-')            setOperator('-');
  else if (e.key === '*')            setOperator('*');
  else if (e.key === '/')            { e.preventDefault(); setOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace')    backspace();
  else if (e.key === 'Escape')       clearAll();
});

// ── Init ───────────────────────────────────────────────────
updateDisplay();