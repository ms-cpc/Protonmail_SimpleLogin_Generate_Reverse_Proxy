// content.js

function initGlobalSimpleLoginWidget() {
  // Guard check: skip setup if the testing tool is already active
  if (document.getElementById("sl-global-panel")) return;

  // Build a fixed container locked to the screen viewport boundaries
  const panel = document.createElement("div");
  panel.id = "sl-global-panel";
  panel.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 2147483647;
    background: #11111a;
    border: 4px solid #FF00FF;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 0 20px #FF00FF;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 240px;
    font-family: system-ui, sans-serif;
  `;

  // Banner Header Label
  const header = document.createElement("div");
  header.innerText = "✨ MAGENTA TESTING CONTROL";
  header.style.cssText = "color: #FF00FF; font-size: 11px; font-weight: bold; border-bottom: 2px solid #FF00FF; padding-bottom: 6px; letter-spacing: 0.5px;";
  panel.appendChild(header);

  // Address Recipient Text Box Entry
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.id = "sl-target-input";
  inputField.placeholder = "Paste target client email here...";
  inputField.style.cssText = "padding: 8px; background: #000000; border: 1px solid #FF00FF; color: #FFFFFF; border-radius: 4px; font-size: 11px; outline: none;";
  panel.appendChild(inputField);

  // Action Processing Trigger Button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerText = "GENERATE REVERSE PROXY";
  btn.style.cssText = "padding: 8px; background-color: #FF00FF; color: #000000; border: none; border-radius: 4px; font-weight: 900; cursor: pointer; font-size: 11px; transition: opacity 0.2s;";
  
  btn.addEventListener("click", () => {
    const rawInput = inputField.value.trim();
    
    if (!rawInput) {
      alert("Type or paste an email address into the Magenta box first.");
      return;
    }

    btn.innerText = "⏳ API HANDSHAKE RUNNING...";
    btn.style.opacity = "0.6";
    btn.disabled = true;

    // Contact our background framework runtime script
    chrome.runtime.sendMessage({
      action: "generateProxyRoute",
      targetContact: rawInput
    }, (response) => {
      btn.disabled = false;
      btn.style.opacity = "1.0";
      btn.innerText = "GENERATE REVERSE PROXY";

      if (response && response.success) {
        // Drop the resultant proxy route address string straight onto your browser clipboard layer
        navigator.clipboard.writeText(response.proxyRoute).then(() => {
          alert(`Proxy Route Created successfully!\n\nCopied to clipboard:\n${response.proxyRoute}\n\nNow clear your Proton 'To' field and paste this address in.`);
          inputField.value = ""; // Clear text field data
        }).catch(() => {
          alert(`Generated Reverse Proxy String:\n\n${response.proxyRoute}\n\nPlease copy this address manually.`);
        });
      } else {
        alert(`API Error Check: ${response ? response.error : "Verify extension options settings menu."}`);
      }
    });
  });

  panel.appendChild(btn);

  // Enforce attachment to the primary document layout element
  const root = document.body || document.documentElement;
  if (root) {
    root.appendChild(panel);
  }
}

// Instantiate injection hooks immediately on initial frame execution passes
initGlobalSimpleLoginWidget();

// Failback background thread loop to handle client-side page navigation updates
setInterval(initGlobalSimpleLoginWidget, 2000);
