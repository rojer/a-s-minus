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
  console.log('initEntireCapture');
  numColumns = 1;
  vLast = hLast = false;
  getDocumentNode();
  html = doc.documentElement;
  initScrollTop = document.body.scrollTop;
  initScrollLeft = document.body.scrollLeft;
  clientH = getClientH();
  clientW = html.clientWidth;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
  var scrollBar = getScrollBar();
  if (scrollBar.x || scrollBar.y) {
    setTimeout(sendRequest,150,{action:"scroll_next_done"});
  } else {
    sendRequest({action:"visible"});
  }
}

function getScrollBar() {
  return {
    x: (window.innerHeight > getClientH()),
    y: (document.body.scrollHeight > window.innerHeight)
  };
}

function initSelectedCapture(){
  console.log('initSelectedCapture');
  var a=document.getElementById("searchbar");
  if(null!==a){
    a.style.display="none";
    var b=document.body;
    b.id="";
  }
  getDocumentNode();
  getDocumentDimension();
  if (!document.getElementById("awesome_screenshot_wrapper")) {
    var c = document.createElement("div");
    document.body.appendChild(c);
    c.innerHTML += wrapperHTML;
  }
  wrapper = document.getElementById("awesome_screenshot_wrapper");
  updateWrapper();
  window.addEventListener("resize", windowResize, false);
  document.body.addEventListener("keydown", selectedKeyDown, false);
  wrapper.addEventListener("mousedown", onWrapperMouseDown, false);
}

function initDelayedCapture(delaySeconds) {
  console.log('initDelayedCapture');
  if (null !== delayInterval) {
    clearInterval(delayInterval);
    delayInterval = null;
    $("#awe_delay_div").remove();
  }
  var d = $('<div id="awe_delay_div"><span>' + delaySeconds + '</span>' +
            '<div id="awe_delay_cancel">Cancel</div></div>').appendTo("body").end();
  d.find("#awe_delay_cancel").on("click", function() {
    clearInterval(delayInterval);
    delayInterval = null;
    d.remove();
  });
  $.Draggable(d[0], {});
  var remaining = delaySeconds;
  delayInterval = setInterval(function() {
    console.log(remaining);
    remaining--;
    if (remaining > 0) {
      $("#awe_delay_div").find("span").text(remaining);
    } else {
      clearInterval(delayInterval);
      delayInterval = null;
      d.remove();
      console.log('boom!');
      setTimeout(function(){chrome.extension.sendRequest({action:"visible"})}, 100);
    }
  }, 1000);
}

function onWrapperMouseDown(a) {
  function onWrapperMouseMove(a){
    setStyle(wrapper,"background-color","rgba(0,0,0,0)");
    e = a.pageX - f;
    d = a.pageY - g;
    selSizeDisplay.children[0].innerHTML = Math.abs(e) + " X " + Math.abs(d);
    updateCorners(f,g,e,d);
    updateCenter(f,g,e,d);
    autoScroll(a);
  }
  function onWrapperMouseUp(a) {
    a.pageX-f!=0&&a.pageY-g!=0||0!=$("#awesome_screenshot_center").width()||(
        setStyle(wrapper,"background-color","rgba(0,0,0,0)"),
        selSizeDisplay.children[0].innerHTML=Math.abs(200)+" X "+Math.abs(200),
        updateCorners(f-100,g-100,200,200),
        updateCenter(f-100,g-100,200,200));
    wrapper.removeEventListener("mousedown", onWrapperMouseDown, false);
    wrapper.removeEventListener("mousemove", onWrapperMouseMove, false);
    wrapper.removeEventListener("mouseup", onWrapperMouseUp, false);
    setStyle(document.getElementById("awesome_screenshot_action"), "display", "block");
    setStyle(selSizeDisplay, "display", "block");
    bindCenter();
  }
  if (0 == a.button) {
    var d,e,f=a.pageX,g=a.pageY;
    var selSizeDisplay = document.getElementById("awesome_screenshot_size");
    document.getElementById("awesome_screenshot_action");
    wrapper.addEventListener("mousemove", onWrapperMouseMove, false);
    wrapper.addEventListener("mouseup", onWrapperMouseUp, false);
  }
}

function selectedKeyDown(a){
  27==a.keyCode&&removeSelection();
}

function getSelection() {
  var selection = document.getElementById("awesome_screenshot_center");
  return {
    left:   getStyle(selection, "left"),
    top:    getStyle(selection, "top"),
    width:  getStyle(selection, "width"),
    height: getStyle(selection, "height")
  };
}

function windowResize(){
  updateWrapper();
  getDocumentDimension();
  var sel = getSelection();
  if (sel.width * sel.height > 0) {
    updateCorners(sel.left, sel.top, sel.width, sel.height);
  }
  dragresize.maxLeft = docW;
  dragresize.maxTop = docH;
}

function bindCenter(){
  function onActionBarClick(a){
    switch (a.target.id) {
      case "awesome_screenshot_capture": captureSelection(); break;
      case "awesome_screenshot_capture_icon": captureSelection(); break;
      case "awesome_screenshot_cancel": removeSelection(); break;
      case "awesome_screenshot_cancel_icon": removeSelection(); break;
    }
  }
  function captureSelection() {
    var a = document.getElementById("awesome_screenshot_size");
    setStyle(a, "display", "none");
    dragresize.deselect(c);
    setStyle(c, "outline", "none");
    numColumns = 1;
    vLast = hLast = false;
    html = document.documentElement;
    initScrollTop = document.body.scrollTop;
    initScrollLeft = document.body.scrollLeft;
    clientH = html.clientHeight;
    clientW = html.clientWidth;
    isSelected = true;
    var selLeft = dragresize.elmX;
    var selTop = dragresize.elmY;
    var selW = dragresize.elmW;
    var selH = dragresize.elmH;
    var offsetX = selLeft - document.body.scrollLeft;
    var offsetY = selTop - document.body.scrollTop;
    if (initScrollTop > selTop) {
      if (offsetX < 0) {
        document.body.scrollLeft = selLeft;
      } else {
        wrapper.style.paddingRight = offsetX + "px";
        document.body.scrollLeft += offsetX;
      }
      if (offsetY < 0) {
        document.body.scrollTop = selTop;
      } else {
        wrapper.style.paddingTop = offsetY + "px";
        document.body.scrollTop += offsetY;
      }
    }
    getDocumentDimension();
    updateCorners(selLeft, selTop, selW, selH);
    if (initScrollTop>selTop){
      if (clientW >= selW && clientH >= selH) {
        setTimeout(sendRequest, 300, {
          action: "visible",
          counter: numColumns,
          ratio: (selH % clientH / clientH),
          scrollBar: {x: false, y: false},
          centerW: selW,
          centerH: selH,
          menuType: "selected"
        });
        return;
      }
      fixAndCapture();
    } else {
      removeSelection();
      setTimeout(function(){sendRequest({action:"capture_selected_done",data:{x:offsetX,y:offsetY,w:selW,h:selH}})}, 100);
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
  document.getElementById("awesome_screenshot_action")
    .addEventListener("click", onActionBarClick, false);
}

function removeSelection(){
  window.removeEventListener("resize",windowResize);
  document.body.removeEventListener("keydown",selectedKeyDown,!1);
  wrapper.parentNode&&wrapper.parentNode.removeChild(wrapper);
  isSelected = false;
}

function autoScroll(a){
  var b=a.clientY,c=a.clientX,d=window.innerHeight-b,e=window.innerWidth-c;
  20>b&&(document.body.scrollTop-=25);
  40>c&&(document.body.scrollLeft-=25);
  40>d&&(document.body.scrollTop+=60-d);
  40>e&&(document.body.scrollLeft+=60-e);
}

function updateCorners(selLeft, selTop, selW, selH){
  var topW =    selW >= 0 ? selLeft + selW : selLeft;
  var topH =    selH >= 0 ? selTop : selTop + selH;
  var rightW =  selW >= 0 ? docW - selLeft - selW : docW - selLeft;
  var rightH =  selH >= 0 ? selTop + selH : selTop;
  var bottomW = selW >= 0 ? docW - selLeft : docW - selLeft - selW;
  var bottomH = docH - rightH;
  var leftW =   docW - bottomW;
  var leftH =   docH - topH;
  var m = document.getElementById("awesome_screenshot_top");
  setStyle(m, "width",  topW + "px");
  setStyle(m, "height", topH + "px");
  var n = document.getElementById("awesome_screenshot_right");
  setStyle(n, "width",  rightW + "px");
  setStyle(n, "height", rightH + "px");
  var o = document.getElementById("awesome_screenshot_bottom");
  setStyle(o, "width",  bottomW + "px");
  setStyle(o, "height", bottomH + "px");
  var p = document.getElementById("awesome_screenshot_left");
  setStyle(p, "width",  leftW + "px");
  setStyle(p, "height", leftH + "px");
}

function updateCenter(a,b,selW,selH){
  var e = selW >= 0 ? a : a + selW;
  var f = selH >= 0 ? b : b + selH;
  var g = document.getElementById("awesome_screenshot_center");
  setStyle(g,"width",Math.abs(selW)+"px");
  setStyle(g,"height",Math.abs(selH)+"px");
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

function scrollNext() {
  var scrollTop = document.body.scrollTop;
  var scrollLeft = document.body.scrollLeft;
  console.log('scrollNext', scrollLeft, scrollTop);
  enableFixedPosition(false);
  var scrollBar = getScrollBar();
  if (isSelected) {
    var sel = getSelection();
    if (clientW >= sel.width && sel.height > clientH) {
      if (sel.top + sel.height == scrollTop + clientH) {
        sendRequest({
          action: "entire_capture_done",
          counter: numColumns,
          ratio: {x: 0, y: (sel.height % clientH / clientH)},
          scrollBar: {x: false, y: true, realX: (window.innerHeight > html.clientHeight)},
          centerW: sel.width,
          centerH: sel.height
        });
        return;
      }
      if (scrollTop + 2 * clientH > sel.top + sel.height) {
        document.body.scrollTop = sel.top + sel.height - clientH;
      } else if (sel.top + sel.height > scrollTop + 2 * clientH) {
        document.body.scrollTop = scrollTop + clientH;
      }
    }
    if (sel.width > clientW && clientH >= sel.height) {
      if (sel.left + sel.width == scrollLeft + clientW) {
        sendRequest({
          action: "entire_capture_done",
          counter: numColumns,
          ratio: {x: (sel.width % clientW / clientW), y: 0},
          scrollBar: {x: true, y: false, realY: (window.innerWidth > html.clientWidth)},
          centerW: sel.width,
          centerH: sel.height
        });
        return;
      }
      if (scrollLeft + 2 * clientW > sel.left + sel.width) {
        document.body.scrollLeft = sel.left + sel.width - clientW;
      } else if (sel.left + sel.width > scrollLeft + 2 * clientW) {
        document.body.scrollLeft = scrollLeft + clientW;
      }
    }
    if (sel.width > clientW && sel.height > clientH) {
      if (sel.top + sel.height == scrollTop + clientH) {
        if (sel.left + sel.width == scrollLeft + clientW) {
          sendRequest({
            action: "entire_capture_done",
            counter: numColumns,
            ratio: {x: (sel.width % clientW / clientW), y: (sel.height % clientH / clientH)},
            scrollBar: {x: true, y: true},
            centerW: sel.width,
            centerH: sel.height
          });
        } else {
          if (scrollLeft + 2 * clientW > sel.left + sel.width) {
            document.body.scrollLeft = sel.left + sel.width - clientW;
          } else if (sel.left + sel.width > scrollLeft + 2 * clientW) {
            document.body.scrollLeft = scrollLeft + clientW;
          }
          numColumns++;
          document.body.scrollTop = sel.top;
          fixAndCapture();
        }
        return;
      }
      if (scrollTop + 2 * clientH > sel.top + sel.height) {
        document.body.scrollTop = sel.top + sel.height - clientH;
      } else if (sel.top + sel.height > scrollTop + 2 * clientH) {
        document.body.scrollTop = scrollTop + clientH;
      }
    }
  } else {
    document.body.scrollTop = scrollTop + clientH;
    if (document.body.scrollTop == scrollTop || vLast) {
      var scrollLeft = document.body.scrollLeft;
      document.body.scrollLeft = scrollLeft + clientW;
      if (!scrollBar.x || document.body.scrollLeft == scrollLeft || hLast) {
        var ratio = {
          y: (scrollTop % clientH / clientH),
          x: (scrollLeft % clientW / clientW)
        };
        document.body.scrollTop = initScrollTop;
        document.body.scrollLeft = initScrollLeft;
        enableFixedPosition(true);
        sendRequest({
          action:"entire_capture_done",
          counter: numColumns,
          ratio: ratio,
          scrollBar: scrollBar
        });
        return;
      } else {
        hLast = (document.body.scrollLeft - scrollLeft < clientW);
      }
      numColumns++;
      document.body.scrollTop = 0;
      vLast = false;
      fixAndCapture();
      return;
    } else {
      vLast = (document.body.scrollTop - scrollTop) < clientH;
    }
  }
  fixAndCapture();
}

function fixAndCapture() {
  setTimeout(function() {
    enableFixedPosition(false);
    setTimeout(sendRequest, 150, {action:"scroll_next_done"});
  }, 150);
}

function sendRequest(a){
  console.log('<', a.action, a);
  chrome.extension.sendRequest(a);
}

function enableFixedPosition(enabled){
  if (enabled) {
    for (var b=0,c=fixedElements.length;c>b;++b) fixedElements[b].style.position = "fixed";
    fixedElements=[];
  } else {
    var it = document.createNodeIterator(document.documentElement,NodeFilter.SHOW_ELEMENT, null, false);
    var element;
    while (element = it.nextNode()){
      var style = document.defaultView.getComputedStyle(element, "");
      if (!style) continue;
      var position = style.getPropertyValue("position");
      if (position == "fixed") {
        fixedElements.push(element);
        element.style.position = "absolute";
      }
    }
  }
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

var isContentScriptLoaded = true;
var doc,html,docW,docH,initScrollTop,initScrollLeft,clientH,clientW;
var numColumns = 1;
var fixedElements=[];
var wrapperHTML =
  '<div id="awesome_screenshot_wrapper">' +
  '  <div id="awesome_screenshot_top"></div>' +
  '  <div id="awesome_screenshot_right"></div>' +
  '  <div id="awesome_screenshot_bottom"></div>' +
  '  <div id="awesome_screenshot_left"></div>' +
  '  <div id="awesome_screenshot_center" class="drsElement drsMoveHandle">' +
  '    <div id="awesome_screenshot_size" style="min-width:70px;"><span>0 X 0</span></div>' +
  '    <div id="awesome_screenshot_action">' +
  '      <a id="awesome_screenshot_cancel"><span id="awesome_screenshot_cancel_icon"></span>Cancel</a>' +
  '      <a id="awesome_screenshot_capture"><span id="awesome_screenshot_capture_icon"></span>Capture</a>' +
  '    </div>' +
  '  </div>' +
  '</div>';
var wrapper,dragresize,isSelected=!1;
var delayInterval = null;
var vLast = false;
var hLast = false;

chrome.extension.onRequest.addListener(function(a){
  console.log('>', a.action, a);
  switch (a.action){
    case "init_entire_capture":   initEntireCapture(); break;
    case "init_selected_capture": initSelectedCapture(); break;
    case "init_delayed_capture":  initDelayedCapture(a.delay); break;
    case "scroll_next": scrollNext(); break;
    case "destroy_selected": removeSelection(); break;
    case "finishAutoSave": {
      var c = "The screenshot has been saved in "+a.path+".";
      notification.show("success",c);
      break;
    }
    case "tabupdate": break;
  }
});

console.log('ASMinus script loaded.');

var notification = {
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
