// Save settings to storage
document.getElementById('saveBtn').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const senderAlias = document.getElementById('senderAlias').value.trim();

  chrome.storage.local.set({
    slApiKey: apiKey,
    slSenderAlias: senderAlias
  }, () => {
    const status = document.getElementById('status');
    status.innerText = "Settings saved successfully!";
    setTimeout(() => { status.innerText = ""; }, 3000);
  });
});

// Load existing settings when opening the menu
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['slApiKey', 'slSenderAlias'], (items) => {
    if (items.slApiKey) document.getElementById('apiKey').value = items.slApiKey;
    if (items.slSenderAlias) document.getElementById('senderAlias').value = items.slSenderAlias;
  });
});
