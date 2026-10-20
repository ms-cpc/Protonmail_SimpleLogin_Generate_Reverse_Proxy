// popup.js

// Initialize history display on load
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
});

document.getElementById("generateBtn").addEventListener("click", () => {
  const inputField = document.getElementById("targetContact");
  const outputField = document.getElementById("proxyOutputField");
  const outputContainer = document.getElementById("outputContainer");
  const btn = document.getElementById("generateBtn");
  const logBox = document.getElementById("logOutput");
  const rawInput = inputField.value.trim();

  logBox.style.display = "none";
  logBox.innerText = "";
  if (outputContainer) outputContainer.style.display = "none";

  if (!rawInput) {
    alert("Please enter a recipient address first.");
    return;
  }

  btn.innerText = "⏳ CONNECTING...";
  btn.disabled = true;

  chrome.runtime.sendMessage({
    action: "generateProxyRoute",
    targetContact: rawInput
  }, (response) => {
    btn.disabled = false;
    btn.innerText = "GENERATE PROXY ROUTE";

    if (response && response.success) {
      const completedProxyString = response.proxyRoute;
      
      // Copy directly to the system clipboard
      navigator.clipboard.writeText(completedProxyString).catch(() => {});

      // Save item directly to extension storage database history
      chrome.storage.local.get({ proxyHistory: [] }, (data) => {
        let history = data.proxyHistory;
        
        // Remove duplicate entry if it exists to clean up list stacking order
        history = history.filter(item => item.recipient.toLowerCase() !== rawInput.toLowerCase());
        
        // Push fresh route details to the top of the history list array stack
        history.unshift({
          recipient: rawInput,
          proxy: completedProxyString
        });

        // Cap history storage size to the 10 most recent entries
        if (history.length > 10) history.pop();

        chrome.storage.local.set({ proxyHistory: history }, () => {
          renderHistory();
          inputField.value = ""; // Clear input box
        });
      });

    } else {
      logBox.style.display = "block";
      logBox.innerText = "SYSTEM ERROR: " + (response ? response.error : "Signal timed out.");
    }
  });
});

// Render the copyable history items list block with individual deletion tags
function renderHistory() {
  const historyList = document.getElementById("historyList");
  chrome.storage.local.get({ proxyHistory: [] }, (data) => {
    historyList.innerHTML = "";
    
    if (data.proxyHistory.length === 0) {
      historyList.innerHTML = "<div style='color: #666; font-size: 11px; font-style: italic;'>No proxies generated yet.</div>";
      return;
    }

    data.proxyHistory.forEach((item, index) => {
      // Container layout
      const div = document.createElement("div");
      div.className = "history-item";
      div.style.cssText = "position: relative; display: flex; justify-content: space-between; align-items: flex-start; padding: 6px; margin-top: 5px; background: #111; border: 1px solid #333; border-radius: 4px; font-size: 11px; color: #fff; word-break: break-all; cursor: pointer;";
      
      // Text layout parameters wrapper
      const textSpan = document.createElement("span");
      textSpan.style.cssText = "padding-right: 25px; flex-grow: 1;";
      textSpan.innerHTML = `<span class="history-tag" style="color: #FF00FF; font-weight: bold; display: block; margin-bottom: 2px;">To: ${item.recipient}</span>${item.proxy}`;
      
      // Clicking text block triggers immediate copy action
      textSpan.addEventListener("click", (e) => {
        navigator.clipboard.writeText(item.proxy);
        div.style.borderColor = "#FF00FF";
        setTimeout(() => { div.style.borderColor = "#333"; }, 2000);
      });
      div.appendChild(textSpan);

      // TARGET SPECIFIC LINE ROW 'X' DELETE ACTION BUTTON
      const xBtn = document.createElement("button");
      xBtn.innerText = "×";
      xBtn.type = "button";
      xBtn.style.cssText = "background: none; border: none; color: #ff5555; font-size: 16px; font-weight: bold; cursor: pointer; padding: 0 4px; margin-left: 5px; line-height: 12px; z-index: 10;";
      
      xBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering parent copy events
        
        let history = data.proxyHistory;
        // Splice target elements out of data tracking array maps cleanly
        history.splice(index, 1);
        
        chrome.storage.local.set({ proxyHistory: history }, () => {
          renderHistory(); // Re-render active rows cleanly
        });
      });
      div.appendChild(xBtn);

      historyList.appendChild(div);
    });
  });
}

// COMPILE AND DOWNLOAD PROTON NATIVE COMPLIANT CONTACT FILE (.VCF) WITH NO POPUPS
document.getElementById("exportVcfBtn").addEventListener("click", () => {
  chrome.storage.local.get({ proxyHistory: [] }, (data) => {
    if (data.proxyHistory.length === 0) {
      alert("There is no proxy history data available to export yet.");
      return;
    }

    const lineBreak = String.fromCharCode(13) + String.fromCharCode(10);
    const vcardRows = [];

    data.proxyHistory.forEach(item => {
      const prefix = item.recipient.split("@");
      const cleanName = "SL_" + prefix[0];
      
      let cleanProxyEmail = item.proxy;
      if (item.proxy.indexOf("<") !== -1 && item.proxy.indexOf(">") !== -1) {
        const parts = item.proxy.split("<");
        if (parts.length > 1) {
          cleanProxyEmail = parts[1].split(">")[0].trim();
        }
      }

      vcardRows.push("BEGIN:VCARD");
      vcardRows.push("VERSION:3.0");
      vcardRows.push("FN:" + cleanName);
      vcardRows.push("EMAIL;TYPE=INTERNET;TYPE=PREF:" + cleanProxyEmail);
      vcardRows.push("END:VCARD");
    });

    const vcfContent = vcardRows.join(lineBreak) + lineBreak;

    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "SimpleLogin_Proton_Contacts.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

// BULK DATA FLUSH TRASH CLEANER ACTION LOGGER WITH VERIFICATION CONFIRMATION
document.getElementById("clearAllBtn").addEventListener("click", () => {
  const messageText = "Are you completely sure you want to delete your entire generated proxy routing log history?";
  if (window.confirm(messageText)) {
    chrome.storage.local.set({ proxyHistory: [] }, () => {
      renderHistory(); // Refresh interface display
    });
  }
});
