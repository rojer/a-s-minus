function hasClass(a,b){
  return a.className.match(new RegExp("(\\s|^)"+b+"(\\s|$)"));
}

function addClass(a,b){
  hasClass(a,b)||(a.className+=" "+b);
}

function removeClass(a,b){
  if(hasClass(a,b)){
    var c=new RegExp("(\\s|^)"+b+"(\\s|$)");
    a.className=a.className.replace(c," ");
  }
}

function initEntireCapture(){
  counter = 1;
  getDocumentNode();
  html = doc.documentElement;
  initScrollTop = document.body.scrollTop;
  initScrollLeft = document.body.scrollLeft;
  clientH = getClientH();
  clientW = html.clientWidth;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
  checkScrollBar();
  window.onresize = checkScrollBar;
  if (scrollBar.x || scrollBar.y) {
    enableFixedPosition(false);
    setTimeout(sendRequest,300,{action:"scroll_next_done"});
  } else {
    sendRequest({action:"visible"});
  }
}

function initSelectedCapture(){
  var a=document.getElementById("searchbar");
  if(null!==a){
    a.style.display="none";
    var b=document.body;
    b.id="";
  }
  getDocumentNode();
  getDocumentDimension();
  if (!document.getElementById("awesome_screenshot_wrapper")) {
    var c=document.createElement("div");
    document.body.appendChild(c);
    c.innerHTML+=wrapperHTML;
  }
  wrapper=document.getElementById("awesome_screenshot_wrapper");
  updateWrapper();
  window.addEventListener("resize",windowResize,!1);
  document.body.addEventListener("keydown",selectedKeyDown,!1);
  wrapper.addEventListener("mousedown",wrapperMouseDown,!1);
}

function wrapperMouseDown(a){
  function b(a){
    setStyle(wrapper,"background-color","rgba(0,0,0,0)");
    e=a.pageX-f;
    d=a.pageY-g;
    h.children[0].innerHTML=Math.abs(e)+" X "+Math.abs(d);
    updateCorners(f,g,e,d);
    updateCenter(f,g,e,d);
    autoScroll(a);
  }
  function c(a){
    a.pageX-f!=0&&a.pageY-g!=0||0!=$("#awesome_screenshot_center").width()||(setStyle(wrapper,"background-color","rgba(0,0,0,0)"),h.children[0].innerHTML=Math.abs(200)+" X "+Math.abs(200),updateCorners(f-100,g-100,200,200),updateCenter(f-100,g-100,200,200)),wrapper.removeEventListener("mousedown",wrapperMouseDown,!1),wrapper.removeEventListener("mousemove",b,!1),wrapper.removeEventListener("mouseup",c,!1),setStyle(document.getElementById("awesome_screenshot_action"),"display","block"),setStyle(h,"display","block"),bindCenter();
  }
  if(0==a.button){
    var d,e,f=a.pageX,g=a.pageY,h=document.getElementById("awesome_screenshot_size");
    document.getElementById("awesome_screenshot_action");
    wrapper.addEventListener("mousemove",b,!1);
    wrapper.addEventListener("mouseup",c,!1);
  }
}

function selectedKeyDown(a){
  27==a.keyCode&&removeSelected();
}

function windowResize(){
  updateWrapper();
  getDocumentDimension();
  var a = document.getElementById("awesome_screenshot_center");
  var b = getStyle(a,"width");
  var c = getStyle(a,"height");
  if(b*c){
    var d = getStyle(a,"left");
    var e = getStyle(a,"top");
    updateCorners(d,e,b,c);
  }
  dragresize.maxLeft = docW;
  dragresize.maxTop = docH;
}

function bindCenter(){
  function a(a){
    switch(a.target.id){
      case "awesome_screenshot_capture": b();break;
      case "awesome_screenshot_capture_icon": b();break;
      case "awesome_screenshot_cancel": removeSelected();break;
      case "awesome_screenshot_cancel_icon": removeSelected();
    }
  }
  function b(){
    var a=document.getElementById("awesome_screenshot_size");
    setStyle(a,"display","none");
    dragresize.deselect(c);
    setStyle(c,"outline","none");
    counter=1;
    html=document.documentElement;
    initScrollTop=document.body.scrollTop;
    initScrollLeft=document.body.scrollLeft;
    clientH=html.clientHeight;
    clientW=html.clientWidth;
    isSelected=!0;
    var b=dragresize.elmX,d=dragresize.elmY,e=dragresize.elmW,f=dragresize.elmH,g=b-document.body.scrollLeft,h=d-document.body.scrollTop;
    initScrollTop>d&&(0>=g?document.body.scrollLeft=b:(wrapper.style.paddingRight=g+"px",document.body.scrollLeft+=g),0>=h?document.body.scrollTop=d:(wrapper.style.paddingTop=h+"px",document.body.scrollTop+=h)),getDocumentDimension(),updateCorners(b,d,e,f);
    if (initScrollTop>d){
      if(clientW>=e&&clientH>=f)return void setTimeout(sendRequest,300,{action:"visible",counter:counter,ratio:f%clientH/clientH,scrollBar:{x:!1,y:!1},centerW:e,centerH:f,menuType:"selected"});
      setTimeout(sendRequest,300,{action:"scroll_next_done"});
    } else {
      removeSelected();
      setTimeout(function(){sendRequest({action:"capture_selected_done",data:{x:g,y:h,w:e,h:f}})},100);
    }
  }
  var c=document.getElementById("awesome_screenshot_center");
  dragresize=new DragResize("dragresize",{maxLeft:docW,maxTop:docH});
  var d=document.getElementById("awesome_screenshot_size"),e=document.getElementById("awesome_screenshot_action");
  dragresize.isElement=function(a){
    return a.className&&a.className.indexOf("drsElement")>-1?!0:void 0;
  }
  dragresize.isHandle=function(a){
    return a.className&&a.className.indexOf("drsMoveHandle")>-1?!0:void 0;
  };
  dragresize.ondragmove=function(a,b){
    var c=dragresize.elmX,f=dragresize.elmY,g=dragresize.elmW,h=dragresize.elmH;
    d.children[0].innerHTML=Math.abs(g)+" X "+Math.abs(h),30>f?setStyle(d,"top","5px"):setStyle(d,"top","-30px");
    var i=-(195-g)/2;190>g?setStyle(e,"right",i+"px"):setStyle(e,"right","0px"),updateCorners(c,f,g,h),updateCenter(c,f,g,h),autoScroll(b);
  }
  dragresize.apply(wrapper);
  dragresize.select(c);
  document.getElementById("awesome_screenshot_action").addEventListener("click",a,!1);
}

function removeSelected(){
  window.removeEventListener("resize",windowResize);
  document.body.removeEventListener("keydown",selectedKeyDown,!1);
  wrapper.parentNode&&wrapper.parentNode.removeChild(wrapper);
  isSelected=!1;
}

function autoScroll(a){
  var b=a.clientY,c=a.clientX,d=window.innerHeight-b,e=window.innerWidth-c;
  20>b&&(document.body.scrollTop-=25);
  40>c&&(document.body.scrollLeft-=25);
  40>d&&(document.body.scrollTop+=60-d);
  40>e&&(document.body.scrollLeft+=60-e);
}

function updateCorners(a,b,c,d){
  var e=c>=0?a+c:a,f=d>=0?b:b+d,g=c>=0?docW-a-c:docW-a,h=d>=0?b+d:b,i=c>=0?docW-a:docW-a-c,j=docH-h,k=docW-i,l=docH-f,m=document.getElementById("awesome_screenshot_top"),n=document.getElementById("awesome_screenshot_right"),o=document.getElementById("awesome_screenshot_bottom"),p=document.getElementById("awesome_screenshot_left");
  setStyle(m,"width",e+"px");
  setStyle(m,"height",f+"px");
  setStyle(n,"width",g+"px");
  setStyle(n,"height",h+"px");
  setStyle(o,"width",i+"px");
  setStyle(o,"height",j+"px");
  setStyle(p,"width",k+"px");
  setStyle(p,"height",l+"px");
}

function updateCenter(a,b,c,d){
  var e=c>=0?a:a+c,f=d>=0?b:b+d,g=document.getElementById("awesome_screenshot_center");
  setStyle(g,"width",Math.abs(c)+"px");
  setStyle(g,"height",Math.abs(d)+"px");
  setStyle(g,"top",f+"px");
  setStyle(g,"left",e+"px");
}

function updateWrapper(){
  setStyle(wrapper,"display","none");
  setStyle(wrapper,"width",document.body.scrollWidth+"px");
  setStyle(wrapper,"height",document.body.scrollHeight+"px");
  setStyle(wrapper,"display","block");
}

function setStyle(a,b,c){
  a.style.setProperty(b,c);
}

function getStyle(a,b){
  return parseInt(a.style.getPropertyValue(b));
}

function scrollNext(){
  var a = document.body.scrollTop,b=document.body.scrollLeft;
  if (isSelected) {
    var c = document.getElementById("awesome_screenshot_center");
    var d = getStyle(c,"left");
    var e = getStyle(c,"top");
    var f = getStyle(c,"width");
    var g = getStyle(c,"height");
    if (clientW>=f&&g>clientH) {
      if(e+g==a+clientH)return void sendRequest({action:"entire_capture_done",counter:counter,ratio:{x:0,y:g%clientH/clientH},scrollBar:{x:!1,y:!0,realX:window.innerHeight>html.clientHeight?!0:!1},centerW:f,centerH:g});a+2*clientH>e+g?document.body.scrollTop=e+g-clientH:e+g>a+2*clientH&&(document.body.scrollTop=a+clientH);
    }
    if (f>clientW&&clientH>=g) {
      if (d+f==b+clientW) return void sendRequest({action:"entire_capture_done",counter:counter,ratio:{x:f%clientW/clientW,y:0},scrollBar:{x:!0,y:!1,realY:window.innerWidth>html.clientWidth?!0:!1},centerW:f,centerH:g});
      b+2*clientW>d+f ? document.body.scrollLeft=d+f-clientW : d+f>b+2*clientW&&(document.body.scrollLeft=b+clientW);
    }
    if (f>clientW&&g>clientH) {
      if (e+g==a+clientH) return d+f==b+clientW ? void sendRequest({action:"entire_capture_done",counter:counter,ratio:{x:f%clientW/clientW,y:g%clientH/clientH},scrollBar:{x:!0,y:!0},centerW:f,centerH:g}):(b+2*clientW>d+f?document.body.scrollLeft=d+f-clientW:d+f>b+2*clientW&&(document.body.scrollLeft=b+clientW),counter++,document.body.scrollTop=e,void setTimeout(sendRequest,300,{action:"scroll_next_done"}));
      a+2*clientH>e+g?document.body.scrollTop=e+g-clientH:e+g>a+2*clientH&&(document.body.scrollTop=a+clientH);
    }
  } else if(document.body.scrollTop=a+clientH,document.body.scrollTop==a) {
    var b=document.body.scrollLeft;
    if (document.body.scrollLeft=b+clientW,!scrollBar.x||document.body.scrollLeft==b) {
      var h={};
      h.y = a % clientH / clientH;
      h.x = b % clientW / clientW;
      document.body.scrollTop = initScrollTop;
      document.body.scrollLeft = initScrollLeft;
      enableFixedPosition(true);
      sendRequest({action:"entire_capture_done", counter:counter, ratio:h, scrollBar:scrollBar});
      return;
    }
    counter++;
    document.body.scrollTop=0;
    setTimeout(sendRequest,300,{action:"scroll_next_done"});
  }
  setTimeout(sendRequest,300,{action:"scroll_next_done"});
}

function sendRequest(a){chrome.extension.sendRequest(a)}

function bindShortcuts(a){
  var b=document.body;
  if (b.removeEventListener("keydown",keydownHandler,!1),b.addEventListener("keydown",keydownHandler,!1),msObj=a.msObj) {
    msObj=JSON.parse(msObj);
    for (var c in msObj) menu[c].enable=msObj[c].enable,menu[c].key=msObj[c].key;
  }
}

function keydownHandler(a){
  switch (String.fromCharCode(a.which)) {
    case menu.visible.key: 1==menu.visible.enable&&a.shiftKey&&a.ctrlKey&&sendRequest({action:"visible"});break;
    case menu.selected.key: 1==menu.selected.enable&&a.shiftKey&&a.ctrlKey&&sendRequest({action:"selected"});break;
    case menu.entire.key: 1==menu.entire.enable&&a.shiftKey&&a.ctrlKey&&sendRequest({action:"entire"});
  }
}

function enableFixedPosition(enabled){
  console.log('enableFixedPosition', enabled);
  if (enabled) {
    for (var b=0,c=fixedElements.length;c>b;++b) fixedElements[b].style.position = "fixed";
    fixedElements=[];
  } else {
    for (var d,e=document.createNodeIterator(document.documentElement,NodeFilter.SHOW_ELEMENT,null,!1);d=e.nextNode();){
      var f = document.defaultView.getComputedStyle(d,"");
      if (!f) return;
      if (f.getPropertyValue("position") == "fixed") {
        fixedElements.push(d);
        d.style.position = "absolute";
      }
    }
  }
}

function checkScrollBar(){
  scrollBar.x = window.innerHeight>getClientH() ? !0 : !1;
  scrollBar.y = document.body.scrollHeight > window.innerHeight ? !0 : !1;
}

function myReplace(a,b){
  var c=a.replace(/[\.\$\^\{\[\(\|\)\*\+\?\\]/gi,"\\$1");
  var d=new RegExp("("+c+")","ig");
  return b.replace(d,'<span style="font-weight:bold">$1</span>');
}

function getDocumentNode(){
  doc = window.document;
  if (window.location.href.match(/https?:\/\/mail.google.com/i)) {
    doc = doc.getElementById("canvas_frame").contentDocument;
  }
}

function getDocumentDimension() {
  docH = document.body.scrollHeight;
  docW = document.body.scrollWidth;
}

function getClientH() {
  return "CSS1Compat" === document.compatMode ? html.clientHeight : document.body.clientHeight;
}

var isContentScriptLoaded=!0,doc,html,docW,docH,initScrollTop,initScrollLeft,clientH,clientW,scrollBar={},counter=1;
var menu={visible:{enable:"false",key:"V"},selected:{enable:"false",key:"S"},entire:{enable:"false",key:"E"}};
var fixedElements=[];
var wrapperHTML='<div id="awesome_screenshot_wrapper"><div id="awesome_screenshot_top"></div><div id="awesome_screenshot_right"></div><div id="awesome_screenshot_bottom"></div><div id="awesome_screenshot_left"></div><div id="awesome_screenshot_center" class="drsElement drsMoveHandle"><div id="awesome_screenshot_size" style="min-width:70px;"><span>0 X 0</span></div><div id="awesome_screenshot_action"><a id="awesome_screenshot_cancel"><span id="awesome_screenshot_cancel_icon"></span>Cancel</a><a id="awesome_screenshot_capture"><span id="awesome_screenshot_capture_icon"></span>Capture</a></div></div></div>';
var wrapper,dragresize,isSelected=!1,hostname=document.location.hostname;
var delayInterval=null;

chrome.extension.onRequest.addListener(function(a){
  switch(a.action){
    case "update_shortcuts": bindShortcuts(a);break;
    case "init_entire_capture": initEntireCapture();break;
    case "init_selected_capture": initSelectedCapture();break;
    case "scroll_next": scrollNext();break;
    case "destroy_selected": removeSelected(); break;
    case "finishAutoSave": var c="The screenshot has been saved in "+a.path+".";notification.show("success",c);break;
    case "tabupdate": break;
    case "delay-capture": {
      if (null !== delayInterval) {
        clearInterval(delayInterval);
        delayInterval = null;
        $("#awe_delay_div").remove();
      }
      var d = $('<div id="awe_delay_div"><span></span><div id="awe_delay_cancel">Cancel</div></div>')
          .appendTo("body").find("span").text(a.sec).end();
      d.find("#awe_delay_cancel").on("click", function() {
        clearInterval(delayInterval);
        delayInterval = null;
        d.remove();
      });
      $.Draggable(d[0], {});
      var e = a.sec ? a.sec - 1 : 2;
      delayInterval = setInterval(function() {
        if (e > 0) {
          $("#awe_delay_div").find("span").text(e);
          e--;
        } else {
          clearInterval(delayInterval);
          delayInterval = null;
          d.remove();
          setTimeout(function(){chrome.extension.sendRequest({action:"visible"})}, 100);
        }
      }, 1000);
    }
  }
});

sendRequest({action:"check_shortcuts"});

window.addEventListener("load",function(){sendRequest({action:"enable_selected"})},!1);

var notification={
  notifyBox: null,

  init: function(){this.create()},

  create: function(){
    var a=this;
    var b='<img id="as-nitofyIcon"><span id="as-notifyMessage"></span><div id="as-notifyClose"></div>';
    this.notifyBox=document.createElement("div");
    this.notifyBox.id="asNotifyBox";
    this.notifyBox.innerHTML=b;
    document.body.appendChild(this.notifyBox);
    var c=document.getElementById("as-notifyClose");
    c.addEventListener("click",function(){a.hide()});
  },

  show: function(a,b){
    var c=this;
    if(document.getElementById("asNotifyBox")||this.init(),"success"==a){
      var d=document.getElementById("as-nitofyIcon");
      d.src=chrome.extension.getURL("")+"images/success.gif"
    }
    document.getElementById("as-notifyMessage").innerText=b;
    this.notifyBox.style.display="block";
    setTimeout(function(){c.notifyBox.style.display="none"},3e3);
  },

  hide: function(){this.notifyBox.style.display="none"}
};
