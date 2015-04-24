function captureVisible() {
  function a() {
    chrome.windows.update(
      currentWindowId,{focused:true},
      function(){
        chrome.tabs.update(
          currentTabId,{active:true},
          function(){
            chrome.tabs.captureVisibleTab(
              null,{format:"png"},
              function(a){
                dataURL.push(a);
                console.log('ok', a.length);
                if (type == "visible") newTab();
              });
          });
      });
  }
  type = "visible";
  getSelectedTab(a);
}

function captureSelected() {
  type = "selected";
  getSelectedTab(function() {
    sendRequest("tab", tabid, {action: "init_selected_capture"});
  });
}

function captureEntire() {
  type = "entire";
  getSelectedTab(function() {
    sendRequest("tab", tabid, {action: "init_entire_capture"});
  });
}

function captureDelayed() {
  type = "delayed";
  getSelectedTab(function() {
    sendRequest("tab", tabid, {action: "init_delayed_capture", delay: localStorage.delay_sec});
  });
}

function getSelectedTab(callback){
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    var activeTab = tabs[0];
    tabid = activeTab.id;
    taburl = activeTab.url;
    tabtitle = activeTab.title;
    console.log('selected tab:', tabid, taburl, tabtitle);
    if (callback != null) callback();
  });
}

function saveAndScroll(){
  pushDataURL();
}

function pushDataURL(){
  chrome.windows.update(
    currentWindowId,{focused:!0},
    function(){
      chrome.tabs.update(
        currentTabId,{active:!0},
        function(){
          chrome.tabs.captureVisibleTab(
            null, {format:"png"},
            function(a) {
              dataURL.push(a);
              sendRequest("tab",tabid,{action:"scroll_next"});
            });
        });
    });
}

function updateShortcutsRequest(tabId){
  chrome.tabs.sendRequest(tabId, {action:"update_shortcuts", config: localStorage.msObj});
}

function newTab(){
  console.log(dataURL instanceof String,dataURL,menuType);
  if (dataURL) {
    if ("selected"==menuType) {
      sendRequest("tab",tabid,{action:"destroy_selected"});
    }
    chrome.tabs.create({url:"edit.html"});
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

function sendRequest(a, tab, request){
  console.log('<', a, tab, request.action, request);
  switch(a) {
    case "tab"  : {
      if (tab == tabid) {
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
      } else {
        chrome.tabs.sendRequest(tab, request);
      }
      break;
    }
    case "popup": chrome.extension.sendRequest(request); break;
  }
}

var win, menuType, type, dataURL=[], tabid, editTabId, taburl, tabtitle, counter, ratio, scrollBar, centerW=0, centerH=0, data, tempDataUrl, currentWindowId, currentTabId, centerOffX=0, centerOffY=0;
localStorage.msObj||(localStorage.msObj='{"visible":{"enable":true,"key":"V"},"selected":{"enable":true,"key":"S"},"entire":{"enable":true,"key":"E"}}');
localStorage.format||(localStorage.format="png");
localStorage.delay_sec||(localStorage.delay_sec=3);

// Clean up old junk from localStorage.
localStorage.removeItem("data-tracking");

$(document).ready(function(){});

localStorage.autoSave="false";
chrome.extension.onRequest.addListener(function(a,b,c){
  function onTestImageReady(){
    var e = document.getElementById("test_image");
    sendRequest("tab", editTabId, {
      menuType: menuType,
      type: type,
      data: dataURL,
      taburl: taburl,
      tabtitle: tabtitle,
      counter: counter,
      ratio: ratio,
      scrollBar: scrollBar,
      centerW: centerW,
      centerH: centerH,
      w: e.width,
      h: e.height,
      centerOffX: centerOffX,
      centerOffY: centerOffY
    });
    dataURL = [];
    e.src = "";
    this.removeEventListener("onload", onTestImageReady, false);
  };
  
  console.log(b.tab);
  chrome.tabs.getSelected(null,function(a){
    currentWindowId=a.windowId;
    currentTabId=a.id;
  });
  console.log('>', a.action, a);
  b.tab&&-1!=b.tab.id&&"visible"!=a.action&&"selected"!=a.action&&"entire"!=a.action||(menuType=a.action,a.menuType&&(menuType=a.menuType));

  switch (a.action){
    case "visible": {
      if ("selected" == menuType) {
        type = "visible";
        centerW = a.centerW;
        centerH = a.centerH;
      }
      captureVisible();
      break;
    }
    case "selected": captureSelected(); break;
    case "entire": captureEntire(); break;
    case "delayed": captureDelayed(); break;
    case "upload": {
      type = "visible";
      menuType = "upload";
      tabtitle = a.title;
      dataURL.push(a.data);
      chrome.tabs.update({url:"edit.html"});
      break;
    }
    case "check_shortcuts": updateShortcutsRequest(b.tab.id); break;
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
      saveAndScroll();
      break;
    }
    case "entire_capture_done": {
      counter = a.counter;
      ratio = a.ratio;
      scrollBar = a.scrollBar;
      type = "entire";
      if ("selected" == menuType) {
        centerW = a.centerW;
        centerH = a.centerH;
      }
      newTab();
      break;
    }
    case "capture_selected_done": {
      type = "visible";
      centerH = a.data.h;
      centerW = a.data.w;
      centerOffX = a.data.x;
      centerOffY = a.data.y;
      captureVisible();
      break;
    }
    case "edit_ready": {
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        editTabId = tabs[0].id;
        console.log('editTabId', editTabId);
        var e = document.getElementById("test_image");
        e.onload = onTestImageReady;
        e.src = dataURL[0];
      });
      break;
    }
    case "copy":chrome.experimental.clipboard.executeCopy(tabid,function(){alert("copied")});break;
    case "exit":chrome.tabs.getSelected(null,function(a){chrome.tabs.remove(a.id)});break;
  };
});

chrome.tabs.onUpdated.addListener(function(a,b,c) {
  if ("chrome-extension://bnophbnknjcjnbadhhkciahanapffepm/#" == b.url) {
    chrome.tabs.remove(c.id);
    chrome.extension.sendRequest({name:"loginByGoogle"});
  }
  chrome.tabs.sendRequest(a,{action:"tabupdate"});
});
