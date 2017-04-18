function captureVisible(ctx, dataCb) {
  ctx.editAction = "visible";
  chrome.windows.update(
    ctx.windowId, {focused:true},
    function(){
      chrome.tabs.update(
        ctx.tabId, {active:true},
        function(){
          chrome.tabs.captureVisibleTab(
            null,{format:"png"},
            function(a){
              ctx.imageData.push(a);
              console.log('captured', a.length, 'bytes');
              if (dataCb) dataCb(a);
            });
        });
    });
}

function captureSelected(ctx) {
  ctx.editAction = "selected";
  sendContentScriptRequest(ctx, {action: "init_selected_capture"});
}

function captureEntire(ctx) {
  ctx.editAction = "entire";
  sendContentScriptRequest(ctx, {action: "init_entire_capture"});
}

function captureDelayed(ctx) {
  ctx.editAction = "delayed";
  sendContentScriptRequest(ctx, {action: "init_delayed_capture",
                                 delay: localStorage.delay_sec});
}

function grabFrame(ctx, video, stream) {
  var canvas = document.getElementById('tempCanvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  var url = canvas.toDataURL("png", null);
  console.log('captured', url.length, 'bytes,', canvas.width+'x'+canvas.height);
  ctx.imageData = [url];
  stream.getTracks()[0].stop();
  video.src = "";
  newTab(ctx);
}

function attachToVideo(ctx, stream) {
  var video = document.getElementById('temp_video');
  video.src = URL.createObjectURL(stream);
  video.onloadedmetadata = function () {
    // Delay capture to allow notification to disappear.
    setTimeout(function() { grabFrame(ctx, video, stream); }, 500);
  };
  video.play();
}

var notificationHandlers = {};

chrome.notifications.onClicked.addListener(function(notificationId) {
  var handler = notificationHandlers[notificationId];
  if (handler) handler("clicked");
});

chrome.notifications.onClosed.addListener(function(notificationId) {
  var handler = notificationHandlers[notificationId];
  if (handler) handler("closed");

});

function showNotification(ctx, stream) {
  var notificationId = "ASM" + (new Date()).toString();
  var doCapture = false;
  notificationHandlers[notificationId] = function(action) {
    if (action == "clicked") {
      doCapture = true;
      chrome.notifications.clear(notificationId);
    }
    if (action == "closed") {
      if (doCapture) {
        attachToVideo(ctx, stream);
      } else {
        stream.getTracks()[0].stop();
      }
    }
  };
  chrome.notifications.create(
      notificationId,
      { type: "basic",
        title: "Desktop Capture",
        message: "Prepare your desktop for capture and click this notification when ready.",
        iconUrl: "images/icon128.png",
        priority: 2,  // highest
        isClickable: true },
      function(notificationId) {}
  );
}

function captureDesktop(ctx) {
  ctx.userAction = "desktop";
  ctx.editAction = "visible";
  chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"], null,
      function(streamId) {
        if (!streamId) return;  // User canceled.
        navigator.webkitGetUserMedia(
            { audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: streamId,
                  maxWidth: window.screen.width,
                  maxHeight: window.screen.height
                }
              }
            },
            function(stream) { showNotification(ctx, stream); },  // success
            function(err) { alert("Screen capture failed: " + err); });
      });
}

function saveAndScroll(ctx){
  captureVisible(ctx, function(){
    sendContentScriptRequest(ctx, {action:"scroll_next"});
  });
}

function updateShortcutsRequest(tabId){
  chrome.tabs.sendRequest(tabId, {action:"update_shortcuts", config: localStorage.msObj});
}

function newTab(ctx){
  if (ctx.imageData) {
    if ("selected" == ctx.userAction) {
      sendContentScriptRequest(ctx, {action:"destroy_selected"});
    }
    chrome.tabs.create({
      url: "edit.html",
      windowId: ctx.windowId,
      active: true,
      selected: true,
      openerTabId: ctx.tabId
    }, function(tab) {
      setContextForTab(tab, ctx);
    });
  } else {
    alert("Screen Capture Fail!!");
  }
}

function injectContentScripts(tab, cb) {
  var files = [
    "stylesheets/selected.css",
    "javascripts/libs/jquery-2.1.3.min.js",
    "javascripts/jquery.draggable.js",
    "javascripts/libs/dragresize.js",
    "javascripts/content_script.js"
  ];
  function injectNextFile() {
    var nextFile = files.shift();
    if (nextFile) {
      if (nextFile.match(/\.css$/)) {
        console.log('injecting CSS', nextFile, 'into tab', tab);
        chrome.tabs.insertCSS(tab, {file: nextFile}, injectNextFile);
      } else {
        console.log('injecting JS', nextFile, 'into tab', tab);
        chrome.tabs.executeScript(tab, {file: nextFile}, injectNextFile);
      }
    } else {
      cb();
    }
  }
  injectNextFile();
}

function sendContentScriptRequest(ctx, request){
  var tab = ctx.tabId;
  console.log('<', tab, request.action, request);
  chrome.tabs.executeScript(tab, {file:"javascripts/content_script_check.js"}, function(results) {
    console.log('check results:', tab, results);
    if (results === undefined) return;
    if (results && results[0] === true) {
      chrome.tabs.sendRequest(tab, request);
    } else {
      injectContentScripts(tab, function(){
        chrome.tabs.sendRequest(tab, request);
      });
    }
  });
}

localStorage.msObj || (localStorage.msObj = '{"visible":{"enable":true,"key":"V"},"selected":{"enable":true,"key":"S"},"entire":{"enable":true,"key":"E"}}');
localStorage.format || (localStorage.format = "png");
localStorage.delay_sec || (localStorage.delay_sec = 3);
localStorage.tip_touch_shown || (localStorage.tip_touch_shown = 0);
localStorage.lastGDriveFolderID || (localStorage.lastGDriveFolderID = "");

// Set the default value for GDrive folder remembering
localStorage.folderPref ||
localStorage.setItem("folderPref",
  JSON.stringify({remember: false, data: {}}));

// Clean up old junk from localStorage.
localStorage.removeItem("data-tracking");
localStorage.removeItem("autoSave");

$(document).ready(function(){});

function handleRequest(ctx, req, sender) {

  function onTestImageReady(){
    var testImage = document.getElementById("test_image");
    var req = {
      userAction: ctx.userAction,
      type: ctx.editAction,
      data: ctx.imageData,
      taburl: ctx.tabURL,
      tabtitle: ctx.tabTitle,
      counter: ctx.numColumns,
      ratio: ctx.remainderRatio,
      scrollBar: ctx.scrollBar,
      centerW: ctx.centerW,
      centerH: ctx.centerH,
      w: testImage.width,
      h: testImage.height,
      centerOffX: ctx.centerOffX,
      centerOffY: ctx.centerOffY
    };
    chrome.tabs.sendRequest(ctx.editTabId, req);
    ctx.imageData = [];
    this.onload = null;
    testImage.src = "";
    setContextForTab([ctx.windowId, ctx.tabId], null);  // Disconnect from original tab.
  };

  switch (req.action){
    case "visible": {
      if ("selected" == ctx.userAction) {
        ctx.editAction = "visible";
        ctx.centerW = req.centerW;
        ctx.centerH = req.centerH;
      }
      captureVisible(ctx, function(){newTab(ctx)});
      break;
    }
    case "selected": captureSelected(ctx); break;
    case "entire": captureEntire(ctx); break;
    case "delayed": captureDelayed(ctx); break;
    case "desktop": captureDesktop(ctx); break;
    case "upload": {
      ctx.userAction = "upload";
      ctx.editAction = "visible";
      ctx.tabTitle = req.title;
      ctx.imageData.push(req.data);
      chrome.tabs.update({url:"edit.html"});
      break;
    }
    case "check_shortcuts": updateShortcutsRequest(ctx.tabId); break;
    case "update_shortcuts": {
      chrome.tabs.getAllInWindow(null, function(tabs){
        for (var i in tabs) {
          var tab = tabs[i];
          var url = tab.url;
          if (url.match(/https?:\/\/*\/*/gi) && !url.match(/https:\/\/chrome.google.com\/extensions/i)) {
            updateShortcutsRequest(tab.id);
          }
        }
      });
      break;
    }
    case "scroll_next_done": {
      saveAndScroll(ctx);
      break;
    }
    case "entire_capture_done": {
      ctx.numColumns = req.numColumns;
      ctx.remainderRatio = req.remainderRatio;
      ctx.scrollBar = req.scrollBar;
      ctx.editAction = "entire";
      if ("selected" == ctx.userAction) {
        ctx.centerW = req.centerW;
        ctx.centerH = req.centerH;
      }
      newTab(ctx);
      break;
    }
    case "capture_selected_done": {
      ctx.editAction = "visible";
      ctx.centerH = req.data.h;
      ctx.centerW = req.data.w;
      ctx.centerOffX = req.data.x;
      ctx.centerOffY = req.data.y;
      captureVisible(ctx, function(){newTab(ctx)});
      break;
    }
    case "edit_ready": {
      ctx.editTabId = sender.tab.id;
      console.log('editTabId', ctx.editTabId);
      var ti = document.getElementById("test_image");
      ti.onload = onTestImageReady;
      ti.src = ctx.imageData[0];
      break;
    }
    case "copy": {
      chrome.experimental.clipboard.executeCopy(ctx.tabId,function(){alert("copied")});
      break;
    }
    case "exit": {
      chrome.tabs.getSelected(null,function(a){chrome.tabs.remove(a.id)});
      break;
    }
  };
}

var contexts = {};

function newContext() {
  return {
    windowId: null,
    tabId: null,
    tabURL: "",
    tabTitle: "",

    userAction: "",
    editAction: "",

    editTabId: -1,
    centerOffX: 0,
    centerOffY: 0,
    centerW: 0,
    centerH: 0,
    numColumns: -1,
    scrollBar: null,
    remainderRatio: -1,

    imageData: [],
  };
}

function newContextForTab(tab) {
  console.log('new ctx for', tab);
  var ctx = newContext();
  ctx.windowId = tab.windowId;
  ctx.tabId = tab.id;
  setContextForTab(tab, ctx);
  return ctx;
}

function stripCtx(ctx) {
  var strippedCtx = {};
  for (var k in ctx) {
    if (k != 'imageData') {
      strippedCtx[k] = ctx[k];
    } else {
      strippedCtx[k] = ctx[k].length;
    }
  }
  return strippedCtx;
}

function getKeyForTabId(windowId, tabId) {
  return windowId + '/' + tabId;
}

function getKeyForTab(tab) {
  if (Array.isArray(tab)) return getKeyForTabId(tab[0], tab[1]);
  return getKeyForTabId(tab.windowId, tab.id);
}

function getContextForTab(tab) {
  var key = getKeyForTab(tab);
  var ctx = contexts[key];
  if (!ctx) ctx = newContextForTab(tab);
  console.log('get ctx:', key, '->', stripCtx(ctx));
  return ctx;
}

function setContextForTab(tab, ctx) {
  var key = getKeyForTab(tab);
  if (ctx != null) {
    console.log('set ctx:', key, '->', stripCtx(ctx));
    contexts[key] = ctx;
  } else {
    console.log('del ctx:', key);
    delete contexts[key];
  }
}

function getCurrentTab(sender, cb) {
  if (sender && sender.tab && sender.tab.id != -1) {
    cb(sender.tab);
  } else {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      cb(tabs[0]);
    });
  }
}

chrome.extension.onRequest.addListener(function(req, sender){
  if (req.action == "desktop") {
    // Desktop captures do not have tab to be associated with.
    var ctx = newContext();
    ctx.userAction = req.action;
    ctx.tabTitle = "Desktop";
    handleRequest(ctx, req, sender);
    return;
  }
  getCurrentTab(sender, function(tab) {
    var ctx = getContextForTab(tab);
    console.log('>', req.action, req, tab);
    if ("visible" == req.action || "selected" == req.action ||
        "entire" == req.action || "delayed" == req.action) {
      ctx.userAction = req.action;
      ctx.tabURL = tab.url;
      ctx.tabTitle = tab.title;
    }
    if (req.userAction) ctx.userAction = req.userAction;
    handleRequest(ctx, req, sender);
  });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  setContextForTab([removeInfo.windowId, tabId], null);
});
