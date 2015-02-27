var shortcutsConfig = {};

function bindShortcuts(req){
  var b = document.body;
  b.removeEventListener("keydown", keydownHandler, false);
  shortcutsConfig = JSON.parse(req.config);
  b.addEventListener("keydown", keydownHandler, false);
}

function keydownHandler(e) {
  if (!e.shiftKey || !e.ctrlKey) return;
  switch (String.fromCharCode(e.which)) {
    case shortcutsConfig.visible.key: {
      if (shortcutsConfig.visible.enable) {
        chrome.extension.sendRequest({action:"visible"});
        e.stopPropagation();
        return;
      }
    }
    case shortcutsConfig.selected.key: {
      if (shortcutsConfig.selected.enable) {
        chrome.extension.sendRequest({action:"selected"});
        e.stopPropagation();
        return;
      }
    }
    case shortcutsConfig.entire.key: {
      if (shortcutsConfig.entire.enable) {
        chrome.extension.sendRequest({action:"entire"});
        e.stopPropagation();
        return;
      }
    }
  }
}

chrome.extension.onRequest.addListener(function(req){
  switch (req.action) {
    case "update_shortcuts": bindShortcuts(req); break;
  }
});

chrome.extension.sendRequest({action:"check_shortcuts"});
