function enablePriceCompare() {
  localStorage.pcnotification = "true";
  localStorage.popupnotification = "true";
  localStorage.barnotification = "true";
  localStorage.show_feature_bar = "false";
  refreshOptions();
}

function disablePriceCompare(){
  localStorage.pcnotification = "false";
  localStorage.popupnotification = "false";
  localStorage.barnotification = "false";
  if ("never" !== localStorage.show_feature_bar) {
    localStorage.show_feature_bar="true";
  }
  refreshOptions();
}

function captureVisible() {
  function a() {
    chrome.windows.update(
        currentWindowId,{focused:!0},
        function(){
          chrome.tabs.update(
            currentTabId,{active:!0},
            function(){
              chrome.tabs.captureVisibleTab(
                null,{format:"png"},
                function(a){
                  dataURL.push(a);
                  newTab();
                });
            });
        });
  }
  type = "visible";
  getSelectedTab(a);
}

function captureSelected() {
  type="selected";
  getSelectedTab(checkContentScript);
}

function captureEntire(){
  type="entire";
  getSelectedTab(checkContentScript);
}

function getSelectedTab(a){
  chrome.tabs.getSelected(
      null, function(b){
        tabid=b.id;
        taburl=b.url;
        tabtitle=b.title;
        null!=a&&a();
      });
}

function checkContentScript(){
  chrome.tabs.executeScript(tabid,{file:"javascripts/isload.js"});
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

function updateShortcutsRequest(a){
  sendRequest("tab",a,{action:"update_shortcuts",msObj:localStorage.msObj})
}

function newTab(){
  console.log(dataURL instanceof String,dataURL,menuType);
  if (dataURL) {
    if ("selected"==menuType) {
      sendRequest("tab",tabid,{action:"destroy_selected"});
    }
    if ("true"==localStorage.autoSave) {
      prepareImage();
    } else {
      chrome.tabs.create({url:"edit.html"}, function(a){
        console.log(tabid+"+"+a.id);
        tabids[a.id]=tabid;
        tabid=a.id;
      });
    }
  } else {
    alert("Screen Capture Fail!!");
  }
}

function prepareImage() {
  var a,b;
  var c = document.getElementById("tempCanvas");
  var d = c.getContext("2d");
  var e = document.getElementById("test_image");
  var f = 17;  //document.getElementById("temp_image"),17);
  var g = function() {
    function h(a,c,e,f,g,i,j,k,m) {
      j=r*b,r==u-1&&(e=b-lastH,g=m=lastH),console.log(r,n,u-1),$("#temp_image").attr({src:a}).load(function(){$(this).unbind("load"),d.drawImage(this,c,e,f,g,i,j,k,m),++r>u-1?(console.log("nextCol"),l()):(console.log("PrepareV"),h(q[++n],c,e,f,g,i,j,k,m))})
    }
    function i(b,c,e,f,g,h,k,l,m) {
      h=j*a,j==t-1&&(c=a-lastW,f=l=lastW),$("#temp_image").attr({src:b}).load(function(){$(this).unbind("load"),d.drawImage(this,c,e,f,g,h,k,l,m),t-1>j&&i(q[++j],c,e,f,g,h,k,l,m)});
    }
    function k(){
      $(c).attr({width:m,height:o});
    }
    function l(){
      if(++j>t-1){
        var d = document.getElementById("pluginobj");
        return"jpg"==localStorage.format?tempDataUrl=c.toDataURL("image/jpeg"):"png"==localStorage.format&&(tempDataUrl=c.toDataURL()),console.log("final",tempDataUrl),d.AutoSave(tempDataUrl,tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," "),localStorage.savePath),void setTimeout(function(){chrome.tabs.getSelected(function(a){chrome.tabs.sendRequest(a.id,{action:"finishAutoSave",path:localStorage.savePath})}),chrome.extension.sendRequest({action:"closeWin"})},1e3);
      }
    j==t-1?(v=a-lastW,w=dw=m-j*a,x=j*a):(v=0,w=dw=a,x=j*a);
    y=0;
    z=dh=b;
    A=0;
    r=0;
    n=r+j*u;
    h(q[n],v,y,w,z,x,A,dw,dh);
    }

    if (a=e.width,b=e.height,console.log(menuType),"visible"==type) {
      var m,o;
      console.log(centerW,centerH,e.width,e.height);
      "selected"==menuType?(m=centerW*window.devicePixelRatio,o=centerH*window.devicePixelRatio,v=centerOffX,y=centerOffY):(m=e.width,o=e.height,v=0,y=0);
      $("#tempCanvas").attr({width:m,height:o});
      d.drawImage(e,v*window.devicePixelRatio,y*window.devicePixelRatio,m,o,0,0,m,o);
      "jpg"==localStorage.format?tempDataUrl=c.toDataURL("image/jpeg"):"png"==localStorage.format&&(tempDataUrl=c.toDataURL());
      var p=document.getElementById("pluginobj");
      console.log(tempDataUrl,tabtitle);
      p.AutoSave(tempDataUrl,tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," "),localStorage.savePath);
      setTimeout(function(){
        chrome.tabs.getSelected(function(a){
          chrome.tabs.sendRequest(a.id,{action:"finishAutoSave",path:localStorage.savePath});
        });
        chrome.extension.sendRequest({action:"closeWin"});
      }, 1e3);
    } else if ("entire"==type||"selected"==type) {
      var q=dataURL;
      console.log("enter entire",q.length,counter,b,a);
      var r=j=n=0,s=q.length,t=counter,u=Math.round(s/t);
      if (!scrollBar.x && scrollBar.y) {
        a-=f,u=s,lastH=b*ratio.y;
        "selected"==menuType?(scrollBar.realX&&(b-=f),m=centerW*window.devicePixelRatio):m=a;
        o=lastH?b*(u-1)+lastH:b*u;
        k();
        var v=0,w=dw=a,x=0,y=0,z=dh=b,A=0;
        h(q[n],v,y,w,z,x,A,dw,dh);
      }
      if (scrollBar.x && !scrollBar.y) {
        b-=f,t=s,lastW=a*ratio.x;
        "selected"==menuType?(scrollBar.realY&&(a-=f),o=centerH*window.devicePixelRatio):o=b;
        m=lastW?a*(t-1)+lastW:a*t;
        k();
        var v=0,w=dw=a,x=0,y=0,z=dh=b,A=0;
        i(q[n],v,y,w,z,x,A,dw,dh);
      }
      if (scrollBar.x && scrollBar.y) {
        lastW=a*ratio.x,lastH=b*ratio.y,a-=f,b-=f;
        "selected"==menuType?(m=centerW*window.devicePixelRatio,o=centerH*window.devicePixelRatio):(m=lastW?a*(t-1)+lastW:a*t,o=lastH?b*(u-1)+lastH:b*u);
        k();
        var v=0,w=dw=a,x=0,y=0,z=dh=b,A=0;
        h(q[n],v,y,w,z,x,A,dw,dh);
      }
    }
    dataURL=[];
    e.removeEventListener("onload",g,!1);
    e.src="";
  };
  e.onload = g;
  e.src = dataURL[0];
}
  
function sendRequest(a,b,c){
  switch(a){
    case "tab" :  chrome.tabs.sendRequest(b,c); break;
    case "popup": chrome.extension.sendRequest(c);
  }
}

var win, menuType, type, dataURL=[], tabid, taburl, tabtitle, counter, ratio, scrollBar, centerW=0, centerH=0, tabids={}, data, tempDataUrl, currentWindowId, currentTabId, D_T, centerOffX=0, centerOffY=0;
localStorage.msObj||(localStorage.msObj='{"visible":{"enable":true,"key":"V"},"selected":{"enable":true,"key":"S"},"entire":{"enable":true,"key":"E"}}');
localStorage.format||(localStorage.format="png");
localStorage.delay_sec||(localStorage.delay_sec=3);
localStorage["data-tracking"]||(localStorage["data-tracking"]=!0);
D_T="true"==localStorage["data-tracking"];

$(document).ready(function(){});

localStorage.autoSave="false";
chrome.extension.onRequest.addListener(function(a,b,c){
  function d(){
    console.log(77,menuType,tabid,taburl);
    sendRequest(
      "tab",tabid, {
        menuType:menuType,
        type:type,
        data:dataURL,
        taburl:taburl,
        tabtitle:tabtitle,
        counter:counter,
        ratio:ratio,
        scrollBar:scrollBar,
        centerW:centerW,
        centerH:centerH,
        w:e.width,
        h:e.height,
        centerOffX:centerOffX,
        centerOffY:centerOffY
      });
    dataURL=[];
    e.src="";
    e.removeEventListener("onload",d,!1);
    e=null;
  };
  
  console.log(b.tab);
  chrome.tabs.getSelected(null,function(a){currentWindowId=a.windowId,currentTabId=a.id});
  console.log(a.action,menuType,b);
  b.tab&&-1!=b.tab.id&&"visible"!=a.action&&"selected"!=a.action&&"entire"!=a.action||(menuType=a.action,a.menuType&&(menuType=a.menuType));

  switch (a.action){
    case "visible": "selected"==menuType&&(type="visible",centerW=a.centerW,centerH=a.centerH),captureVisible(),sendRequest("tab",tabid,{action:"restorebar"});break;
    case "selected": captureSelected();break;
    case "entire": captureEntire();break;
    case "https": alert("For security reason, Capture Selected Area doesn't work in https pages! Please try other options.");
    case "insert_script": "selected"==menuType&&(chrome.tabs.executeScript(tabid,{file:"javascripts/dragresize.js"}),chrome.tabs.insertCSS(tabid,{file:"stylesheets/selected.css"}),console.log("insert")),chrome.tabs.executeScript(tabid,{file:"javascripts/content_script.js"},function(){sendRequest("tab",tabid,{action:"init_"+menuType+"_capture"})});break;
    case "script_running": sendRequest("tab",tabid,{action:"init_"+type+"_capture"});break;
    case "check_shortcuts": updateShortcutsRequest(b.tab.id);break;
    case "update_shortcuts": chrome.tabs.getAllInWindow(null,function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b],e=d.url;e.match(/https?:\/\/*\/*/gi)&&!e.match(/https:\/\/chrome.google.com\/extensions/i)&&updateShortcutsRequest(d.id)}});break;
    case "scroll_next_done": sendRequest("tab",tabid,{action:"hidescroll"}),saveAndScroll(),sendRequest("tab",tabid,{action:"restorescroll"});break;
    case "entire_capture_done": counter=a.counter,ratio=a.ratio,scrollBar=a.scrollBar,type="entire","selected"==menuType&&(centerW=a.centerW,centerH=a.centerH),console.log("newTab"),sendRequest("tab",tabid,{action:"restorebar"}),newTab();break;
    case "capture_selected_done":type="visible",centerH=a.data.h,centerW=a.data.w,centerOffX=a.data.x,centerOffY=a.data.y,captureVisible();break;
    case "ready":var e=document.getElementById("test_image");e.onload=d,console.log(dataURL[0]),e.src=dataURL[0];break;
    case "copy":chrome.experimental.clipboard.executeCopy(tabid,function(){alert("copied")});break;
    case "exit":chrome.tabs.getSelected(null,function(a){chrome.tabs.remove(a.id)});break;
    case "get_option":c({options:localStorage.msObj});break;
    case "openNewTab":var g=a.url;chrome.tabs.create({url:g});break;
    case "enablePriceCompare":console.log("enable"),enablePriceCompare(),localStorage.show_feature_bar="false";break;
    case "getShowFeatureBar":c(localStorage.show_feature_bar);break;
    case "disableShowFeatureBar":localStorage.show_feature_bar="never";break;
  };
});

chrome.tabs.onUpdated.addListener(function(a,b,c) {
  if ("chrome-extension://bnophbnknjcjnbadhhkciahanapffepm/#" == b.url) {
    chrome.tabs.remove(c.id);
    chrome.extension.sendRequest({name:"loginByGoogle"});
  }
  chrome.tabs.sendRequest(a,{action:"tabupdate"});
});

chrome.tabs.onRemoved.addListener(function(a){
  tabids[a]&&chrome.tabs.update(tabids[a],{selected:!0});
});
