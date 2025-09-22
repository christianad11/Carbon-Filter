// Carbon Filter - Content Script with Options


let isEnabled = true;
let fieldSettings = {
  email: true,
  phone: true,
  creditCard: true,
  ssn: true
};
let customTexts = [];

// Load initial state
chrome.storage.local.get(['enabled', 'fieldSettings', 'customTexts'], (result) => {
  isEnabled = result.enabled !== false;
  fieldSettings = result.fieldSettings || fieldSettings;
  customTexts = result.customTexts || [];
  if (isEnabled) {
    processPage();
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    isEnabled = message.enabled;
    if (isEnabled) {
      processPage();
    } else {
      unmaskAll();
    }
    sendResponse({ success: true });
  } else if (message.action === 'updateSettings') {
    // Reload settings and reprocess
    chrome.storage.local.get(['enabled', 'fieldSettings', 'customTexts'], (result) => {
      isEnabled = result.enabled !== false;
      fieldSettings = result.fieldSettings || fieldSettings;
      customTexts = result.customTexts || [];
      
      // Always unmask first to clear existing masks
      unmaskAll();
      
      if (isEnabled) {
        processPage();
      }
    });
    sendResponse({ success: true });
  }
  return true;
});

function processPage() {
  if (!isEnabled) return;
  
  // Get active patterns based on field settings
  const patterns = {};
  if (fieldSettings.email) {
    patterns.email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  }
  if (fieldSettings.phone) {
    patterns.phone = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  }
  if (fieldSettings.creditCard) {
    patterns.creditCard = /\b(?:\d[ -]*?){13,19}\b/g;
  }
  if (fieldSettings.ssn) {
    patterns.ssn = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
  }
  
  // Add custom text patterns
  customTexts.forEach((text, index) => {
    if (text.trim()) {
      const escapedText = escapeRegExp(text.trim());
      patterns[`custom_${index}`] = new RegExp(escapedText, 'gi');
    }
  });
  
  // Walk through text nodes
  walkTextNodes(document.body, patterns);
}

function walkTextNodes(node, patterns) {
  if (!node) return;
  
  if (node.nodeType === Node.TEXT_NODE) {
    processTextNode(node, patterns);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Skip script and style elements
    if (['script', 'style'].includes(node.tagName.toLowerCase())) return;
    
    // Skip elements that are already masked
    if (node.classList.contains('privacy-mask')) return;

    // Process child nodes
    Array.from(node.childNodes).forEach(child => {
      walkTextNodes(child, patterns);
    });
  }
}

function processTextNode(textNode, patterns) {
  if (!textNode.textContent) return;
  
  let text = textNode.textContent;
  let hasChanges = false;
  
  // Apply patterns
  Object.entries(patterns).forEach(([type, pattern]) => {
    if (pattern.test(text)) {
      pattern.lastIndex = 0;
      text = text.replace(pattern, (match) => {
        hasChanges = true;
        // Use 'custom' class for custom text patterns
        const maskType = type.startsWith('custom_') ? 'custom' : type;
        return `<span class="privacy-mask privacy-mask-${maskType}">${match}</span>`;
      });
    }
  });
  
  // Replace text if changes were made
  if (hasChanges) {
    const wrapper = document.createElement('span');
    wrapper.innerHTML = text;
    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(wrapper, textNode);
    }
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unmaskAll() {
  const maskedElements = document.querySelectorAll('.privacy-mask');
  maskedElements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.replaceChild(document.createTextNode(element.textContent), element);
    }
  });
}

// MutationObserver to handle dynamic content
const observer = new MutationObserver((mutations) => {
  if (!isEnabled) return;
  
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
        // Re-process the added node and its subtree
        processPage(); // Re-process the entire page for simplicity
      }
    });
  });
});

// Observe changes in the DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});