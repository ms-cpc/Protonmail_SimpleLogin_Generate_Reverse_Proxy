// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateProxyRoute") {
    
    // HARDCODED PROFILE CONFIGURATION
    const apiKey = "lplthotzoehdzymewbxiojwoqhzdhfjonrlrywterdxwocwhugpkgvcbtplc"; 
    const targetFromAddress = "mark@southby.ca";

    const slash = String.fromCharCode(47);
    
    // FIXED LOOKUP: Uses the V2 cluster and explicitly provides page_id=0 to pass server validation filters
    const searchUrl = [
      "https:", "", "api.simplelogin.io", "api", "v2", "aliases"
    ].join(slash) + "?page_id=0&query=" + encodeURIComponent(targetFromAddress);

    console.log("DEBUG SCAN: Pinging full URL path -> " + searchUrl);

    fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication": apiKey 
      }
    })
    .then(async (res) => {
      const rawText = await res.text();
      
      if (!res.ok) {
        sendResponse({ success: false, error: "Lookup Rejected [HTTP " + res.status + "]: " + rawText });
        return;
      }

      const aliasData = JSON.parse(rawText);
      const foundAlias = aliasData.aliases && aliasData.aliases.find(a => a.email.toLowerCase() === targetFromAddress);
      
      if (!foundAlias || !foundAlias.id) {
        sendResponse({ success: false, error: "The custom alias identity \"" + targetFromAddress + "\" was not found inside your SimpleLogin account directory." });
        return;
      }

      const aliasId = foundAlias.id;

      // Rebuilds: https://simplelogin.io{id}/contacts
      const creationUrl = [
        "https:", "", "api.simplelogin.io", "api", "aliases", aliasId, "contacts"
      ].join(slash);

      console.log("DEBUG CREATION: Routing contact request to -> " + creationUrl);

      fetch(creationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication": apiKey 
        },
        body: JSON.stringify({
          contact: request.targetContact.trim()
        })
      })
      .then(async (response) => {
        const creationText = await response.text();
        if (!response.ok) {
          sendResponse({ success: false, error: "Proxy Configuration Request Denied [HTTP " + response.status + "]: " + creationText });
          return;
        }

        const data = JSON.parse(creationText);
        if (data && data.reverse_alias) {
          sendResponse({ success: true, proxyRoute: data.reverse_alias });
        } else {
          sendResponse({ success: false, error: "SimpleLogin returned an unrecognized success database payload structure." });
        }
      })
      .catch(err => sendResponse({ success: false, error: "Step 2 Core Routing Failure: " + err.message }));
    })
    .catch(err => sendResponse({ success: false, error: "Step 1 Base Network Connection Failure: " + err.message }));

    return true; 
  }
});

// ==========================================
// NEW WINDOW SNIPPET PASTED SAFELY BELOW HERE
// ==========================================
chrome.action.onClicked.addListener(() => {
  // Spawns popup.html in its own isolated independent window frame object shell
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 350,
    height: 520
  });
});