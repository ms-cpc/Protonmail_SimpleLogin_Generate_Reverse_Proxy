// Render the copyable history items list block with safe text node assignments
function renderHistory() {
  const historyList = document.getElementById("historyList");
  chrome.storage.local.get({ proxyHistory: [] }, (data) => {
    historyList.innerHTML = "";
    
    if (data.proxyHistory.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText = "color: #666; font-size: 11px; font-style: italic;";
      emptyDiv.textContent = "No proxies generated yet.";
      historyList.appendChild(emptyDiv);
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
      
      // SAFE REPLACEMENT: Build separate inline text segments to eliminate raw innerHTML parsing entirely
      const tagSpan = document.createElement("span");
      tagSpan.className = "history-tag";
      tagSpan.style.cssText = "color: #FF00FF; font-weight: bold; display: block; margin-bottom: 2px;";
      tagSpan.textContent = `To: ${item.recipient}`;
      
      const proxyText = document.createTextNode(item.proxy);
      
      textSpan.appendChild(tagSpan);
      textSpan.appendChild(proxyText);
      
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
        history.splice(index, 1);
        
        chrome.storage.local.set({ proxyHistory: history }, () => {
          renderHistory(); 
        });
      });
      div.appendChild(xBtn);

      historyList.appendChild(div);
    });
  });
}
