var Bg=chrome.extension.getBackgroundPage();
$(document).ready(function(){
  function a(){if(localStorage.msObj){var a=JSON.parse(localStorage.msObj),b=1==a.visible.enable?"Ctrl+Shift+"+a.visible.key:"Not set",c=1==a.selected.enable?"Ctrl+Shift+"+a.selected.key:"Not set",d=1==a.entire.enable?"Ctrl+Shift+"+a.entire.key:"Not set";$("#visible").find(".shortcut").remove().end().append("<span class='shortcut'>"+b+"</span>"),$("#selected").find(".shortcut").remove().end().append("<span class='shortcut'>"+c+"</span>"),$("#entire").find(".shortcut").remove().end().append("<span class='shortcut'>"+d+"</span>")}}
  function b(){$(".i18n").each(function(){var a=this,b=a.id;$(a).html(chrome.i18n.getMessage(b.replace(/-/,"")))}),$(".title").each(function(){var a=this,b=a.id;$(a).attr({title:chrome.i18n.getMessage(b.replace(/-/,"")+"_title")})})}
  function c(){$("ul").remove(),$("#capturing").fadeIn("slow")}
  function d(a){chrome.extension.sendRequest(a)}
  
  chrome.windows.getCurrent(function(a){chrome.tabs.getSelected(a.id,function(b){chrome.browserAction.getBadgeText({tabId:b.id},function(b){"New"==b&&(chrome.browserAction.setBadgeText({text:""}),chrome.tabs.create({url:"http://www.appchangelog.com/log/19/Awesome-Screenshot:-Capture-&-Annotate/Awesome-screenshot-for-iOS-8"}),localStorage.isClickedOnNew="true",a.close())})})});
  
  var e,f=!0;
  b();
  a();
  chrome.windows.getCurrent(function(a){chrome.tabs.getSelected(a.id,function(a){console.log(new Date),e=a.url;var b=e.match(/https?:\/\/*\/*/gi);(null==b||e.match(/https:\/\/chrome.google.com\/extensions/i))&&$("#entire, #selected, #delay-capture").attr({title:chrome.i18n.getMessage("disableEntireTitle")}).css({color:"#909090"}).unbind("click"),"complete"!=a.status&&($("#selected").attr({title:"Page still loading! Please wait."}).css({color:"#909090"}),f=!1),/http|https|file|ftp/.test(e.slice(0,5))||$("#visible").css({color:"#909090"}).unbind("click")})});
  chrome.extension.onRequest.addListener(function(a){
    switch(a.action){
      case "enable_selected": if(e.match(/https:\/\/*\/*/gi)) return void $("#selected").attr({title:"For security reason, Capture Selected Area doesn't work in https pages!"});f=!0,$("#selected").attr({title:""}).css({color:"#000"});break;
      case "shownew": window.close();break;
      case "closeWin": window.close();
    }
  });
  $("a").click(function(){
    var a=this.id;
    if ("visible"==a) {
      d({action:a});
      window.close();
    }
    if ("delay-capture"==a) {
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendRequest(activeTab.id, {action:a, sec:localStorage.delay_sec});
      });
      window.close();
    }
    if ("entire"==a) {
      c(),d({action:a}),c();
    }
    if ("selected"==a) {
      f?(window.close(),d({action:a})):d({action:"https"});
      window.close();
    }
    if ("upload"==a){
      var b=chrome.extension.getURL("")+"upload.html";
      chrome.tabs.create({url:b});
      window.close();
    }
    if("option"==a){
      var b=chrome.extension.getURL("")+"options.html";
      chrome.tabs.create({url:b});
      window.close();
    }
    if("help"==a){
      var b=chrome.extension.getURL("")+"help.html";
      chrome.tabs.create({url:b});
      window.close();
    }
  });
});
