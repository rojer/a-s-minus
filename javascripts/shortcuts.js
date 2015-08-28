var shortcutsConfig = {};

function bindShortcuts(req){
  var b = document.body;
  b.removeEventListener("keydown", keydownHandler, false);
  shortcutsConfig = JSON.parse(req.config);
  b.addEventListener("keydown", keydownHandler, false);
}

function keydownHandler(e) {
  // Remember the Polish S, check the altKey too when checking for Ctrl.
  // https://medium.com/medium-eng/the-curious-case-of-disappearing-polish-s-fa398313d4df
  if (!e.shiftKey || !e.ctrlKey || e.altKey) return;
  switch (String.fromCharCode(e.which)) {
    case shortcutsConfig.visible.key: {
      if (shortcutsConfig.visible.enable) {
        e.preventDefault();
        e.stopPropagation();
        chrome.extension.sendRequest({action:"visible"});
        return;
      }
    }
    case shortcutsConfig.selected.key: {
      if (shortcutsConfig.selected.enable) {
        e.preventDefault();
        e.stopPropagation();
        chrome.extension.sendRequest({action:"selected"});
        return;
      }
    }
    case shortcutsConfig.entire.key: {
      if (shortcutsConfig.entire.enable) {
        e.preventDefault();
        e.stopPropagation();
        chrome.extension.sendRequest({action:"entire"});
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
