function init() {
  function a(){function a(a){_gaq.push(["_trackEvent","Captures",a.target.id,"capture"])}var b=document.getElementsByTagName("ul")[0];b.addEventListener("click",a,!1)}
  function b(){function a(a){"A"==a.target.tagName&&_gaq.push(["_trackEvent","SavePageActions",$(a.target).attr("id"),"click"]),"INPUT"==a.target.tagName&&_gaq.push(["_trackEvent","SavePageActions","share_link","click"])}$("#tool-panel>a").click(function(a){_gaq.push(["_trackEvent","Annotations",a.target.id,"click"])}),$("#tool-panel>div, #feedback").click(function(a){function b(a){var c=a.nodeName;return("A"!=c&&"DIV"!=c||"LI"==a.parentNode.nodeName||"LI"==a.parentNode)&&(a=a.parentNode,b(a)),a}var c=b(a.target);"DIV"!=c.nodeName&&_gaq.push(["_trackEvent","Annotations",c.id,"click"])}),$("#save").click(function(){$("#re-edit").click(function(){_gaq.push(["_trackEvent","SavePageActions","re_edit","click"]),$("#save-tip").unbind("click",a)}),$("#save-tip").click(a)}),$("#feedback").click(function(a){"A"==a.target.tagName&&_gaq.push(["_trackEvent","SavePageActions",$(a.target).parent().attr("id"),"click"])})}
  function c(){$("#action_panel").click(function(a){if("INPUT"==a.target.tagName)switch(a.target.value){case"Reset":_gaq.push(["_trackEvent","OptionsPageActions","Reset","click"]);break;case"Save":_gaq.push(["_trackEvent","OptionsPageActions","Save","click"]);break;case"Close":_gaq.push(["_trackEvent","OptionsPageActions","Close","click"])}})}
  switch(document.body.className){
    case "popup_page": a(); break;
    case "edit_page": b(); break;
    case "options_page": c();
  }
}
  
if("Windows"==BrowserDetect.OS||"Linux"==BrowserDetect.OS){
  var _gaq=_gaq||[];
  _gaq.push(["_setAccount","UA-295754-20"]);
  _gaq.push(["_trackPageview"]);
  function(){
    var a=document.createElement("script");
    a.type="text/javascript";
    a.async=!0;
    a.src="https://ssl.google-analytics.com/ga.js";
    (document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0]).appendChild(a);
  }();
  window.onload=init;
}
