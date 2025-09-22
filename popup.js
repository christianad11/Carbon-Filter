// Carbon Filter - Popup Controller

const mainToggle = document.getElementById('mainToggle');
const status = document.getElementById('status');
const options = document.getElementById('options');
const customInput = document.getElementById('customInput');
const addCustomBtn = document.getElementById('addCustom');
const customList = document.getElementById('customList');

// Field checkboxes
const fieldCheckboxes = {
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  creditCard: document.getElementById('creditCard'),
  ssn: document.getElementById('ssn')
};

// Load saved state
chrome.storage.local.get(['enabled', 'fieldSettings', 'customTexts'], (result) => {
  const enabled = result.enabled !== false;
  mainToggle.checked = enabled;
  status.textContent = enabled ? 'ON' : 'OFF';
  
  // Show/hide options based on main toggle
  if (enabled) {
    options.classList.add('show');
  }
  
  // Load field settings
  const fieldSettings = result.fieldSettings || {
    email: true,
    phone: true,
    creditCard: true,
    ssn: true
  };
  
  Object.keys(fieldCheckboxes).forEach(field => {
    fieldCheckboxes[field].checked = fieldSettings[field] !== false;
  });
  
  // Load custom texts
  const customTexts = result.customTexts || [];
  updateCustomList(customTexts);
});
    
// Handle main toggle
mainToggle.addEventListener('change', () => {
  const enabled = mainToggle.checked;
  status.textContent = enabled ? 'ON' : 'OFF';
  
  // Show/hide options
    if (enabled) {
    options.classList.add('show');
    } else {
    options.classList.remove('show');
  }
  
  // Save state
  chrome.storage.local.set({ enabled: enabled });
  
  // Send message to content script
  sendUpdateToContent();
});

// Handle field toggles
Object.keys(fieldCheckboxes).forEach(field => {
  fieldCheckboxes[field].addEventListener('change', () => {
    saveFieldSettings();
    sendUpdateToContent();
      });
    });
    
// Handle custom text addition
addCustomBtn.addEventListener('click', () => {
  const text = customInput.value.trim();
  if (text) {
    addCustomText(text);
    customInput.value = '';
  }
});

customInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const text = customInput.value.trim();
    if (text) {
      addCustomText(text);
      customInput.value = '';
    }
  }
});



function saveFieldSettings() {
  const fieldSettings = {};
  Object.keys(fieldCheckboxes).forEach(field => {
    fieldSettings[field] = fieldCheckboxes[field].checked;
  });
  chrome.storage.local.set({ fieldSettings: fieldSettings });
}

function addCustomText(text) {
  chrome.storage.local.get(['customTexts'], (result) => {
    const customTexts = result.customTexts || [];
    if (!customTexts.includes(text)) {
      customTexts.push(text);
      chrome.storage.local.set({ customTexts: customTexts });
      updateCustomList(customTexts);
      sendUpdateToContent();
    } else {
    }
  });
}

function removeCustomText(text) {
  chrome.storage.local.get(['customTexts'], (result) => {
    const customTexts = result.customTexts || [];
    const index = customTexts.indexOf(text);
    if (index > -1) {
      customTexts.splice(index, 1);
      chrome.storage.local.set({ customTexts: customTexts });
      updateCustomList(customTexts);
      sendUpdateToContent();
    }
  });
}

function updateCustomList(customTexts) {
  customList.innerHTML = '';
  customTexts.forEach((text, index) => {
    const item = document.createElement('div');
    item.className = 'custom-item';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      removeCustomText(text);
    });
    
    item.appendChild(textSpan);
    item.appendChild(removeBtn);
    customList.appendChild(item);
  });
}

function sendUpdateToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      // Check if it's a valid page for content scripts
      const url = tabs[0].url;
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSettings'
      }).catch(() => {});
    }
  });
}