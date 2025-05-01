const appId = '72324';
const redirectUri = 'http://localhost:3000/';
let ws;
let token;
let masterWs;

const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const contractForm = document.getElementById('contract-form');
const symbolDropdown = document.getElementById('symbol-dropdown');
const buyBtn = document.getElementById('buy-contract');
const result = document.getElementById('buy-result');
const copyTradingSection = document.getElementById('copy-trading');
const masterTokenInput = document.getElementById('master-token');
const copyBtn = document.getElementById('start-copy');
const copyStatus = document.getElementById('copy-status');

loginBtn.onclick = () => {
  const url = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = url;
};

const params = new URLSearchParams(window.location.search);
token = params.get('token1');

if (token) {
  ws = new WebSocket('wss://ws.derivws.com/websockets/v3');

  ws.onopen = () => {
    ws.send(JSON.stringify({ authorize: token }));
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.msg_type === 'authorize') {
      userName.textContent = data.authorize.full_name || data.authorize.loginid;
      userInfo.classList.remove('hidden');
      contractForm.classList.remove('hidden');
      copyTradingSection.classList.remove('hidden');
      loadSymbols();
    }

    if (data.msg_type === 'buy') {
      result.textContent = `✅ Contract bought. ID: ${data.buy.contract_id}`;
    }

    if (data.msg_type === 'active_symbols') {
      symbolDropdown.innerHTML = '';
      data.active_symbols.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol.symbol;
        option.textContent = `${symbol.display_name} (${symbol.symbol})`;
        symbolDropdown.appendChild(option);
      });
    }

    if (data.error) {
      result.textContent = `❌ Error: ${data.error.message}`;
    }
  };
}

function loadSymbols() {
  ws.send(JSON.stringify({ active_symbols: 'brief', product_type: 'basic' }));
}

buyBtn.onclick = () => {
  const type = document.getElementById('contract-type').value;
  const amount = document.getElementById('stake').value;
  const symbol = symbolDropdown.value;

  const buyRequest = {
    buy: 1,
    price: amount,
    parameters: {
      amount: amount,
      basis: 'stake',
      contract_type: type,
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol: symbol
    }
  };

  ws.send(JSON.stringify(buyRequest));
};

copyBtn.onclick = () => {
  const masterToken = masterTokenInput.value.trim();
  if (!masterToken) return;

  masterWs = new WebSocket('wss://ws.derivws.com/websockets/v3');
  masterWs.onopen = () => {
    masterWs.send(JSON.stringify({ authorize: masterToken }));
    copyStatus.textContent = '🔄 Listening for trades...';
  };

  masterWs.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.msg_type === 'authorize') {
      masterWs.send(JSON.stringify({ proposal_open_contract: 1, subscribe: 1 }));
    }
    if (data.msg_type === 'proposal_open_contract') {
      console.log('Master contract update:', data);
      // Future: Replicate trades based on contract details
    }
  };
};
const app_id = 72324;
const redirect_uri = 'https://deriv.com/';
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + app_id);

let token = '';
let active_symbols = [];

function login() {
  window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}&redirect_uri=${redirect_uri}`;
}

function parseTokenFromURL() {
  const url = new URL(window.location.href);
  token = url.searchParams.get("token1");
  if (token) {
    authorize();
  }
}

function authorize() {
  ws.send(JSON.stringify({ authorize: token }));
}

ws.onmessage = function (msg) {
  const data = JSON.parse(msg.data);

  if (data.msg_type === 'authorize') {
    document.querySelector('#account-info').classList.remove('hidden');
    document.querySelector('#account-info').innerHTML = `
      <strong>Account:</strong> ${data.authorize.loginid}<br>
      <strong>Balance:</strong> ${data.authorize.balance} ${data.authorize.currency}
    `;
    getActiveSymbols();
  }

  if (data.msg_type === 'active_symbols') {
    active_symbols = data.active_symbols;
    const select = document.querySelector('#symbol-select');
    select.innerHTML = '';
    active_symbols.forEach(s => {
      const option = document.createElement('option');
      option.value = s.symbol;
      option.text = `${s.display_name}`;
      select.appendChild(option);
    });
    document.querySelector('#symbol-select').classList.remove('hidden');
    document.querySelector('#contract-type').classList.remove('hidden');
    document.querySelector('#amount').classList.remove('hidden');
    document.querySelector('#buy-button').classList.remove('hidden');
    document.querySelector('#active-symbols').classList.remove('hidden');
    listSymbols();
  }

  if (data.msg_type === 'buy') {
    document.querySelector('#buy-result').textContent = `✔ Contract Purchased! ID: ${data.buy.contract_id}`;
  }
};

function getActiveSymbols() {
  ws.send(JSON.stringify({
    active_symbols: 'brief',
    product_type: 'basic'
  }));
}

function listSymbols() {
  const list = active_symbols.map(s => s.display_name).join(', ');
  document.querySelector('#active-symbols').textContent = `Active Symbols: ${list}`;
}

function buyContract() {
  const symbol = document.querySelector('#symbol-select').value;
  const contractType = document.querySelector('#contract-type').value;
  const amount = parseFloat(document.querySelector('#amount').value);

  if (!amount || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }

  const proposal = {
    buy: 1,
    price: amount,
    parameters: {
      amount,
      basis: 'stake',
      contract_type: contractType,
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol
    }
  };

  ws.send(JSON.stringify(proposal));
}

parseTokenFromURL();
