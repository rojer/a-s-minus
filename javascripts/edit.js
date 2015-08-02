function prepareEditArea(req) {
  function addTileY(imgSrc, sx, sy, sw, sh, dx, dy, dw, dh){
    dy = counterY * imageHeight;
    if (counterY == numTilesY - 1) {
      sy = imageHeight - lastH;
      sh = dh = lastH;
    }
    $("#save-image").attr({src: imgSrc}).load(function(){
      $(this).unbind("load");
      showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);
      counterY++;
      if (counterY >= numTilesY) {
        nextColumn();
      } else {
        addTileY(images[++n], sx, sy, sw, sh, dx, dy, dw, dh);
      }
    });
  }
  function addTileX(imgSrc, sx, sy, sw, sh, dx, dy, dw, dh){
    dx = counterX * imageWidth;
    if (counterX == numTilesX - 1) {
      sx = imageWidth - lastW;
      sw = dw = lastW;
    }
    $("#save-image").attr({src: imgSrc}).load(function(){
      $(this).unbind("load");
      showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);
      if (counterX < numTilesX - 1) {
        addTileX(images[++counterX], sx, sy, sw, sh, dx, dy, dw, dh);
      }
    });
  }
  function nextColumn() {
    counterX++;
    if (counterX <= numTilesX - 1) {
      var columnOffsetX, columnWidth;
      if (counterX == numTilesX - 1) {
        centerOffX = imageWidth - lastW;
        columnWidth = editW - counterX * imageWidth;
        columnOffsetX = counterX * imageWidth;
      } else {
        centerOffX = 0;
        columnWidth = imageWidth;
        columnOffsetX = counterX * imageWidth;
      }
      centerOffY = 0;
      counterY = 0;
      n = counterY + counterX * numTilesY;
      addTileY(images[n],
               centerOffX, centerOffY, columnWidth, imageHeight,
               columnOffsetX, 0, columnWidth, imageHeight);
    }
  }
  var images = req.data;
  var imageWidth = req.w;
  var imageHeight = req.h;
  taburl = req.taburl;
  tabtitle = req.tabtitle;
  var centerOffX = req.centerOffX;
  var centerOffY = req.centerOffY;
  getEditOffset();
  var scrollbarWidth = getScrollbarWidth();
  var n = 0;
  switch (req.type){
    case "visible": {
      $("#save-image").attr({src:images[0]}).load(function(){
        if ("selected" == req.userAction) {
          editW = req.centerW * window.devicePixelRatio;
          editH = req.centerH * window.devicePixelRatio;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
          addMargin();
          getEditOffset();
        } else if ("upload" == req.userAction) {
          editW = imageWidth;
          editH = imageHeight;
          centerOffX = 0;
          centerOffY = 0;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
        } else {
          editW = imageWidth - scrollbarWidth;
          editH = imageHeight - scrollbarWidth;
          centerOffX = 0;
          centerOffY = 0;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
        }
        imageWidth = editW;
        imageHeight = editH;
        showCtx.drawImage(this, centerOffX * window.devicePixelRatio, centerOffY * window.devicePixelRatio, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
        $(this).unbind("load");
      });
      break;
    }
    case "entire": {
      var lastRatio = req.ratio;
      var scrollBar = req.scrollBar;
      var counterY = 0;
      var counterX = 0;
      var numImages = images.length;
      var numTilesX = req.counter;
      var numTilesY = Math.round(numImages / numTilesX);
      var centerOffX = 0, centerOffY = 0, x=0;
      if (!scrollBar.x && scrollBar.y) {
        imageWidth -= scrollbarWidth;
        numTilesY = numImages;
        lastH = imageHeight * lastRatio.y;
        if ("selected" == req.userAction) {
          if (scrollBar.realX) imageHeight -= scrollbarWidth;
          editW = req.centerW * window.devicePixelRatio;
        } else {
          editW = imageWidth;
        }
        editH = lastH ? imageHeight * (numTilesY-1) + lastH : imageHeight * numTilesY;
        updateEditArea();
        updateShowCanvas();
        getEditOffset();
        addMargin();
        getEditOffset();
        addTileY(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      } else if (scrollBar.x && !scrollBar.y) {
        imageHeight -= scrollbarWidth;
        numTilesX = numImages;
        lastW = imageWidth * lastRatio.x;
        if ("selected" == req.userAction) {
          if (scrollBar.realY) imageWidth -= scrollbarWidth;
          editH = req.centerH * window.devicePixelRatio;
        } else {
          editH = imageHeight;
        }
        editW = lastW ? imageWidth * (numTilesX - 1) + lastW : imageWidth * numTilesX;
        updateEditArea();
        updateShowCanvas();
        $editArea.addClass("add-margin");
        getEditOffset();
        addTileX(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      } else if (scrollBar.x && scrollBar.y) {
        imageWidth -= scrollbarWidth;
        imageHeight -= scrollbarWidth;
        lastW = imageWidth * lastRatio.x;
        lastH = imageHeight * lastRatio.y;
        if ("selected" == req.userAction) {
          editW = req.centerW * window.devicePixelRatio;
          editH = req.centerH * window.devicePixelRatio;
        } else {
          editW = lastW ? imageWidth * (numTilesX - 1) + lastW : imageWidth * numTilesX;
          editH = lastH ? imageHeight * (numTilesY - 1) + lastH : imageHeight * numTilesY;
        }
        updateEditArea();
        updateShowCanvas();
        addTileY(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      }
    }
  }
}

function prepareTools(){
  $("#exit").click(function(){
    chrome.extension.sendRequest({action:"exit"});
  });

  $("#tool-panel>div").click(function(a){
    function b(a){
      var c=a.nodeName;
      "A"!=c&&"DIV"!=c&&(a=a.parentNode,b(a));
      return a;
    }
    var c = b(a.target);
    if (c.nodeName != "DIV") selectTool(c.id);
  });
}

function bindShortcuts(){
  $("body").keydown(function(e){
    // In text entry mode, the only shortcut enabled is cancel.
    // This is kinda ugly, bleh.
    if (currentAction != null && currentAction.isText) {
      if (e.which == 27) {
        selectTool("cancel");
      } else if (!currentAction.isUndoable() && e.which == 90 && e.ctrlKey && !e.altKey) {
        selectTool("undo");
      }
      return;
    }
    var tool = "";
    if (e.which == 90 && e.ctrlKey && !e.altKey) {  /* Ctrl-Z */
      tool = "undo";
    } else if (!e.ctrlKey && !e.altKey) {
      switch (e.which) {
        case 67 /* c */: tool = "crop"; break;
        case 82 /* r */: tool = "rectangle"; break;
        case 69 /* e */: tool = "ellipse"; break;
        case 65 /* a */: tool = "arrow"; break;
        case 76 /* l */: tool = "line"; break;
        case 70 /* f */: tool = "free-line"; break;
        case 72 /* h */: tool = "text-highlighter"; break;
        case 66 /* b */: tool = "blur"; break;
        case 84 /* t */: tool = "text"; break;
        case 13 /* enter */: tool = "done"; break;
        case 27 /* esc */: tool = "cancel"; break;
        case 83 /* s */: tool = "save"; break;
      }
    }
    if (tool) {
      selectTool(tool);
    }
  });
}

var Repeated = function(actionConstructor, resultCb) {
  var o = this;

  var isDone = false;
  this.resultCb = function(result) {
    resultCb(result);
    if (!isDone) setTimeout(newAction, 100);
  };

  function newAction() {
    o.action = actionConstructor(o.resultCb);
  }

  this.done = function() { isDone = true; o.action.done(); }
  this.cancel = function() { o.action.cancel(); }
  this.isUndoable = function() { return o.action.isUndoable(); }

  newAction();
}

var Draggable = function(actionConstructor, resultCb) {
  var o = this;
  var isDone = false;
  var dragdiv = null;
  var drag = null;
  var result = null;

  this.resultCb = function(actionResult) {
    updateUndoButton();
    if (isDone) {
      resultCb(actionResult);
      return;
    }
    result = actionResult;
    var w = result.data.width, h = result.data.height;
    var canvas = $('<canvas>').attr({width: w, height: h})[0];
    dragdiv = $('<div class="draggable">')
      .css({left: result.x, top: result.y, width: w, height: h})
      .append(canvas)
      .insertAfter(showCanvas)[0];
    canvas.getContext("2d").putImageData(result.data, 0, 0);
    drag = new DragResize("dragresize", {
      handles: [],
      maxLeft: editW,
      maxTop: editH,
      allowBlur: true,
    });
    drag.isElement = function(a) {
      return a.className && a.className.indexOf("draggable") > -1 ? true : false;
    };
    drag.isHandle = drag.isElement;
    drag.apply(document.getElementById("edit-area"));
    drag.select(dragdiv);
    drag.ondragblur = doneMoving;
  };

  function doneMoving() {
    if (dragdiv) {
      if (result) {
        result.x = $(dragdiv).position().left;
        result.y = $(dragdiv).position().top;
      }
      dragdiv.remove();
      if (result) resultCb(result);
      dragdiv = drag = result = null;
      $editArea.unbind();
    }
  }

  var action = actionConstructor(o.resultCb);

  this.done = function() {
    isDone = true;
    if (drag) {
      drag.deselect(true);
    } else {
      action.done();
    }
  }
  this.cancel = function() {
    action.cancel();
    result = null;
    doneMoving();
  }
  this.isUndoable = function() { return action.isUndoable(); }
}

function updateSelectedToolButton() {
  if (selectedTool != null) {
    $($("#"+selectedTool)).siblings().removeClass("active").end().addClass("active");
  } else {
    $("#annotation_bar .title").removeClass("active");
  }
}

function newAction(tool) {
  var a = null;
  switch (tool) {
    case "crop": {
      a = new CropAction(commit);
      break;
    }

    case "rectangle":
    case "ellipse": {
      a = new Repeated(function(cb) {
        return new Draggable(function(cb) {
          return new DrawShapeAction(tool, cb);
        }, cb);
      }, commit);
      break;
    }
    case "arrow":
    case "line": {
      a = new Repeated(function(cb) { return new DrawShapeAction(tool, cb); }, commit);
      break;
    }
    case "free-line": {
      a = new Repeated(FreeLineAction, commit);
      break;
    }
    case "text-highlighter": {
      a = new Repeated(HighLightAction, commit);
      break;
    }
    case "blur": {
      a = new Repeated(function(cb) { return new BlurAction(cb); }, commit);
      break;
    }
    case "text": {
      a = new Repeated(function(cb) {
        return new Draggable(function(cb) { return new TextAction(cb); }, cb);
      }, commit);
      a.isText = true;  // This is ugly.
      break;
    }
  }
  if (a != null) {
    selectedTool = tool;
    updateSelectedToolButton();
  } else {
    console.error("unknown tool:", tool);
  }
  return a;
}

function selectTool(tool) {
  console.log("selectTool", tool);

  switch (tool) {
    case "color": color(); break;
    case "done": {
      if (currentAction != null) currentAction.done();
      // Crop should not be automatically repeated. Another ugly hack, sorry.
      if (selectedTool != "crop") {
        currentAction = newAction(selectedTool);
      } else {
        currentAction = selectedTool = null;
        updateSelectedToolButton();
      }
      break;
    }
    case "cancel": {
      if (currentAction != null) {
        if (currentAction.isUndoable()) {
          currentAction.cancel();
          currentAction = newAction(selectedTool);
        } else {
          currentAction.cancel();
          currentAction = null;
        }
      }
      if (currentAction == null) {
        selectedTool = null;
        updateSelectedToolButton();
      }
      break;
    }
    case "undo": {
      undo();
      break;
    }
    case "save": {
      if (currentAction != null) currentAction.done();
      currentAction = null;
      selectedTool = null;
      save();
      break;
    }
    default: {
      if (selectedTool == tool && currentAction != null) return;
      updateSelectedToolButton(tool);
      if (currentAction != null) currentAction.done();
      $(showCanvas).unbind();
      currentAction = newAction(tool);
      updateUndoButton();
    }
  }
}

function commit(a) {
  var before;
  if (!('x' in a && 'y' in a)) {
    before = {
      a: "undo " + a.a,
      data: showCtx.getImageData(0, 0, showCanvas.width, showCanvas.height),
    };
  } else {
    before = {
      a: "undo " + a.a,
      data: showCtx.getImageData(a.x, a.y, a.data.width, a.data.height),
      x: a.x, y: a.y,
    };
  }
  actions.push([before, a]);
  applyAction(a);
  updateUndoButton();
}

function applyAction(a) {
  var x, y;
  console.log('applyAction', a.a, a.x, a.y, a.data.width, a.data.height);
  if (!('x' in a && 'y' in a)) {
    editW = a.data.width;
    editH = a.data.height;
    updateShowCanvas();
    updateEditArea();
    getEditOffset();
    showCtx.putImageData(a.data, 0, 0);
  } else {
    var c = document.createElement("canvas");
    c.width = a.data.width;
    c.height = a.data.height;
    c.getContext("2d").putImageData(a.data, 0, 0);
    showCtx.drawImage(c, a.x, a.y);
  }
}

function undo() {
  var currentActionIsUndoable = (currentAction != null && currentAction.isUndoable());
  if (currentAction != null) currentAction.cancel();
  if (!currentActionIsUndoable && actions.length != 0) {
    var before = actions.pop()[0];
    applyAction(before);
  }
  currentAction = (selectedTool != null ? newAction(selectedTool) : null);
  updateUndoButton();
}

function i18n(){$("title").text(chrome.i18n.getMessage("editTitle")),document.getElementById("save").lastChild.data=chrome.i18n.getMessage("saveBtn"),document.getElementById("done").lastChild.data=chrome.i18n.getMessage("doneBtn"),document.getElementById("cancel").lastChild.data=chrome.i18n.getMessage("cancelBtn"),document.getElementById("save_button").lastChild.data=chrome.i18n.getMessage("save_button"),$(".title").each(function(){$(this).attr({title:chrome.i18n.getMessage(this.id.replace(/-/,""))})}),$(".i18n").each(function(){$(this).html(chrome.i18n.getMessage(this.id.replace(/-/,"")))}),$("#share")[0].innerHTML+='<div class="tip">[?]<div>Images hosted on <a href="http://awesomescreenshot.com" target="_blank">awesomescreenshot.com</a></div></div>'}

function save() {
  function embedLocalSave() {
    function a() {
      $("#image_loader").hide(),$("#save-image, #re-edit").css({visibility:"visible"});
      if ($("#save-image").outerWidth() > parseInt($("#save_image_wrapper").css("width"))) {
        $("#save-image").css({width:"100%"});
      }
      $("#save-tip").show();
    }
    function b(b) {
      $("#save-image")[0].src!=b?$("#save-image").attr({src:b}).load(function(){$(this).css({width:"auto"}),this.width>=parseInt($("#save_image_wrapper").css("width"))&&$(this).css({width:"100%"}),a(),$(this).unbind()}):a();
    }
    c = ("jpg" == localStorage.format) ? showCanvas.toDataURL("image/jpeg") : showCanvas.toDataURL();
    b(c);
    var d = $("#save-image").attr("src").split(",")[1].replace(/\+/g,"%2b");
    e = tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g, " ");
    f = $("#save-image").attr("src").split(",")[0].split("/")[1].split(";")[0];
    $("#save-flash-btn").empty().append('<div id="flash-save"></div>');
    var g = "10", h = null;
    var i = {data:d,dataType:"base64",filename:e+"."+f,width:100,height:30};
    var j = {allowScriptAccess:"always"};
    var k = {};
    k.id = "CreateSaveWindow";
    k.name = "CreateSaveWindow";
    k.align = "middle";
    swfobject.embedSWF("media/CreateSaveWindow.swf","flash-save","100","30",g,h,i,j,k);
    chrome.extension.sendRequest({
      action: "return_image_data",
      data: c.replace(/^data:image\/(png|jpeg);base64,/,""),
      title: tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," ")
    });
  }

  function onUploadClicked() {
    function uploadToAS() {
      if (localStorage.format && !isPngCompressed) {
        l.image_type = localStorage.format;
      }
      e = $.ajax({
        url: m+"cmd="+h+"&pv="+i+"&ct="+j+"&cv="+k,
        type: "POST",
        data: JSON.stringify(l),
        timeout: 3e5,
        dataType: "json",
        contentType: "text/plain; charset=UTF-8",
        beforeSend: function() {
          $("#saveOnline .content").hide("fast");
          $("#legacySave").show();
          $("#loader").fadeIn("slow");
        },
        error: function() { onUploadError(); },
        success: function(a,d,e) {
          $("#loader").hide();
          if (200==e.status && 1==a.code) {
            uploadDone(a.result.url);
          } else {
            onUploadError();
          }
        },
        complete:function(){}
      });
    }

    function uploadDone(a){
      $("#share-button, #email-link").show("slow").click(function(a){
        var b=a.target;
        $(b).addClass("visited");
      }).find("a").each(function(){
        var b=this;
        if ("buzz"==b.id) {
          b.href+="message="+encodeURI(tabtitle)+"&url="+encodeURI(taburl)+"&imageurl="+a;
        }
        if ("twitter"==b.id) {
          b.href="http://twitter.com/share?url="+encodeURIComponent(a)+"&via=awe_screenshot&text="+tabtitle;
        } else {
          $(b).attr({href:b.href+a});
        }
      });
      $("#share-link").show("slow").find('input[type="text"]').attr({value:a}).bind("mouseup",function(){$(this).select()});
    }

    function onUploadError() {
      $("#loader").hide("fast"),g||$("#error").show().find("#retry").unbind("click").click(function(){$("#error").hide(),$("#loader").show().find("a").unbind("click").click(d),a()});
    }

    function d() {
      g = 1;
      e.abort();
      $("#upload").parent().siblings().hide("fast").end().fadeIn("slow");
      g = 0;
    }

    var e;
    var f = $("#save-image").attr("src").replace(/^data:image\/(png|jpeg);base64,/,"");
    var g = 0, h="imageUpload",i="1.0",j="chrome",k=getLocVersion();
    var l = {src_url:taburl,src_title:tabtitle,image_md5:$.md5(f),image_type:"jpg",image_content:f};
    var m = "http://awesomescreenshot.com/client?";
    uploadToAS();
    window.showShare = b;
    window.errorHandle = c;
    window.abortUpload = d;
  }

  $(".content>.as, .content>.as").removeAttr("style");
  $("#saveOnline .content .diigo input[name=title]").val(tabtitle);
  document.body.scrollTop = 0;
  $("#save-tip").hide();
  $("#image_loader").css({display:"inline-block"});
  $("#save-image, #re-edit").css({visibility:"hidden"});
  $("body").removeClass("crop draw-text").addClass("save");
  $("#save").removeClass("active");
  $("#show-canvas").toggle();
  $("#share+dd").html(chrome.i18n.getMessage("savedShareDesc"));
  $("#upload").parent().html($("#upload")[0].outerHTML);
  $($editArea).enableSelection();
  $("#upload").unbind().click(onUploadClicked);
  $("#re-edit").unbind().text(chrome.i18n.getMessage("reEdit")).click(function(){
    if (uploadFlag) {
      $("#uploadingWarning").jqm().jqmShow();
    } else {
      $("#saveOnline .content .diigo input[name=title]").val("");
      $("body").removeClass("save");
      $("#show-canvas").toggle();
      $($editArea).disableSelection();
      $("#share+dd div").hide();
      $("#save_local+dd>p").hide();

      $("#gdrive-share-link").hide();
      $("#gdrive-save-form").show();
    }
  });
  var c = "";
  setTimeout(embedLocalSave, 100);
  window.uploadImageToAS = onUploadClicked;
  if (!isSavePageInit) {
    SavePage.init();
    isSavePageInit = !0;
  }
}

var CropAction = function(resultCb) {
  $("body").addClass("selected");
  $("body").removeClass("draw").addClass("crop");
  $(".cd-input").val("");
  getEditOffset();
  var drawCanvas = $('<canvas id="draw-canvas">').insertAfter(showCanvas)[0];
  $(showCanvas).unbind("mousedown click");
  $(drawCanvas)
    .css({left: "0px", top: "0px", cursor: "crosshair"})
    .attr({width: showCanvas.width, height: showCanvas.height});
  var drawCtx = drawCanvas.getContext("2d");
  drawCtx.fillStyle = "rgba(80, 80, 80, 0.4)";
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  var selecting = false;
  var cropTip = $("#crop-tip");
  var cropSize = $("#crop-size").hide();
  var cd = $("#cropdiv");
  var drag = null;

  function updateCropWindow() {
    var c = cd;
    var t = parseInt(cd.css("top"));
    var l = parseInt(cd.css("left"));
    var w = parseInt(cd.css("width"));
    var h = parseInt(cd.css("height"));
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.clearRect(l, t, w, h);
    updateCropSize(w, h);
  }
  function updateCropSize(a, b) {
    cropSize
      .html(Math.abs(a) + " X " + Math.abs(b))
      .css({top: (parseInt(cd.css("top")) < 30 ? "5px" : "-25px")});
    $("#cd-width").val(Math.abs(a));
    $("#cd-height").val(Math.abs(b));
  }
  function edgeScroll(e) {
    var y = e.clientY;
    var yLeft = window.innerHeight - y;
    if (y < 80) document.body.scrollTop -= 25;
    if (yLeft < 40) document.body.scrollTop += 60 - yLeft;
    var x = e.clientX;
    var xLeft = window.innerWidth - x;
    if (x < 80) document.body.scrollLeft -= 25;
    if (xLeft < 40) document.body.scrollLeft += 60 - xLeft;
  }
  var cropStartX, cropStartY;
  function startSelection(l, t) {
    cropTip.hide();
    $("#crop-size").show();
    $("#crop-dimension").show();
    cropStartX = l;
    cropStartY = t;
    selecting = true;
    cd.show();
    cd.css({pointerEvents: "none", left: l, top: t, width: 0, height: 0, outline: "1px dashed #777"});
    updateCropWindow();
  }
  function continueSelection(x, y) {
    var cropLeft = x > cropStartX ? cropStartX : x;
    var cropTop = y > cropStartY ? cropStartY : y;
    var cropW = Math.abs(x - cropStartX);
    var cropH = Math.abs(y - cropStartY);
    cd.css({left: cropLeft, top: cropTop, width: cropW, height: cropH});
    updateCropWindow();
  }
  function endSelection() {
    if (!selecting) return;
    selecting = false;
    $("#draw-canvas").unbind();
    $("body").addClass("selected");

    cd.css({pointerEvents: "auto"});
    drag = new DragResize("dragresize", {maxLeft: editW, maxTop: editH, allowBlur: false});
    drag.isElement = function(a) {
      return a.className && a.className.indexOf("drsElement") > -1 ? true : false;
    };
    drag.isHandle = function(a) {
      return a.className && a.className.indexOf("drsMoveHandle") > -1 ? true : false;
    };
    drag.apply(document.getElementById("edit-area"));
    drag.select(cd[0]);
    drag.ondragmove = function() {
      cropTip.hide();
      updateCropWindow();
    };
  }
  $("#draw-canvas").hover(function() {
    cropTip.text(chrome.i18n.getMessage("cropTip")).show();
  }, function() {
    cropTip.hide();
  });
  $("#draw-canvas")
    .on("mousedown", function(e) {
      startSelection(e.pageX - editOffsetX, e.pageY - editOffsetY);
    })
    .on("mousemove", function(e) {
      edgeScroll(e);
      var x = e.pageX - editOffsetX;
      var y = e.pageY - editOffsetY;
      if (selecting) {
        if (e.buttons & 1) {
          continueSelection(x, y);
        } else {
          endSelection();
        }
      } else {
        cropTip.css({left: x + 5 + "px", top: y + 5 + "px"});
      }
    })
    .on("mouseup", function(b) { endSelection(); })
    .on("touchstart", function(e) {
      var t = e.originalEvent.changedTouches[0];
      startSelection(t.pageX - editOffsetX, t.pageY - editOffsetY);
      e.originalEvent.preventDefault();
    })
    .on("touchmove", function(e) {
      var t = e.originalEvent.changedTouches[0];
      edgeScroll(t);
      continueSelection(t.pageX - editOffsetX, t.pageY - editOffsetY);
      e.originalEvent.preventDefault();
    })
    .on("touchend", function(e) {
      endSelection();
      e.originalEvent.preventDefault();
    });

  $(".cd-input").off()
    .on("input", function(){
      var w = $("#cd-width").val();
      var h = $("#cd-height").val();
      cd.css({width:w, height:h});
      updateCropWindow();
      if (drag != null) {
        drag.deselect(cd[0]);
        drag.select(cd[0]);
      }
    });
  cd.on("mousedown", function(){$(".cd-input").trigger("blur")});

  this.finish = function() {
    $("#cropdiv").hide();
    $("#crop-tip").hide();
    $("#crop-size").hide();
    $("#crop-dimension").hide();
    $("body").removeClass("crop selected").addClass("cropped");
    $("#crop").removeClass("active");
    $(drawCanvas).remove();
  }

  this.done = function() {
    this.finish();
    var cropLeft = parseInt($("#cropdiv").css("left"));
    var cropTop = parseInt($("#cropdiv").css("top"));
    var cropWidth = parseInt($("#cropdiv").css("width"));
    var cropHeight = parseInt($("#cropdiv").css("height"));
    var croppedImageData = showCtx.getImageData(cropLeft, cropTop, cropWidth, cropHeight);
    resultCb({a: "crop", data: croppedImageData});
  }

  this.cancel = this.finish;
  this.isUndoable = function() { return false; }
}

function color(){
  var a = null;
  $("#color").find("ul").fadeIn()
    .hover(function(b){ $(this).show(); if (a) clearTimeout(a); b.stopPropagation()},
           function(){var b=$(this); a = setTimeout(function(){ b.fadeOut(300); },300);})
    .click(function(a){
      var b=$(a.target).css("background-color");
      $(this).prev("span").css({"background-color":b});
      drawColor = b;
      highlightColor = $(a.target).attr("data-highlight-color");
      contrastColor = $(a.target).attr("data-contrast-color");
      if ($("#text").hasClass("active")) $("div[contenteditable]").css({color:drawColor});
      $("#color").find("ul").fadeOut(300);
      a.stopPropagation();
    });
}

function updateUndoButton() {
  var enabled = actions.length > 0 || (currentAction && currentAction.isUndoable());
  if (enabled) {
    $("#undo").addClass("enabled");
  } else {
    $("#undo").removeClass("enabled");
  }
}

function cut(canvas, action, x, y, w, h, margin) {
  var ctx = canvas.getContext("2d");
  var cutX = Math.max(0, x - margin);
  var cutY = Math.max(0, y - margin);
  var cutW = Math.min(w + 2 * margin, canvas.width - cutX);
  var cutH = Math.min(h + 2 * margin, canvas.height - cutY);
  return {
    a: action,
    data: ctx.getImageData(cutX, cutY, cutW, cutH),
    x: cutX, y: cutY,
  };
}

function DrawShapeAction(shape, resultCb) {
  var o = this;
  $(showCanvas).addClass("draw");

  var drawCanvas = $('<canvas>')
    .attr({id: "draw-canvas", width: showCanvas.width, height: showCanvas.height})
    .css({cursor: "crosshair"})
    .insertAfter(showCanvas)[0];
  var drawCtx = drawCanvas.getContext("2d");
  var startX, startY, pointerX, pointerY, drawRectX, drawRectY, drawRectW, drawRectH;
  var drawing = false;
  $(drawCanvas)
    .on("mousedown", function(e) { onPointerDown(e.pageX, e.pageY); })
    .on("touchstart", function(e) {
      var t = e.originalEvent.changedTouches[0];
      onPointerDown(t.pageX, t.pageY);
      e.originalEvent.preventDefault();
    });
  var margin = freeLineWidth;

  function onPointerDown(pageX, pageY) {
    startX = pageX - editOffsetX;
    startY = pageY - editOffsetY;

    $(drawCanvas)
      .on("mousemove", function(e) { onPointerMove(e.pageX, e.pageY); })
      .on("touchmove", function(e) {
        var t = e.originalEvent.changedTouches[0];
        onPointerMove(t.pageX, t.pageY);
        e.originalEvent.preventDefault();
      })
  }

  function drawRectangle() {
    drawCtx.strokeRect(drawRectX, drawRectY, drawRectW, drawRectH);
  }

  function drawEllipse() {
    function _drawEllipse(a,b,c,d) {
      var e = c / 2 * 0.5522848;
      var f = d / 2 * 0.5522848;
      var g = a + c;
      var h = b + d;
      var i = a + c / 2;
      var j = b + d / 2;
      drawCtx.moveTo(a,j);
      drawCtx.bezierCurveTo(a,j-f,i-e,b,i,b);
      drawCtx.bezierCurveTo(i+e,b,g,j-f,g,j);
      drawCtx.bezierCurveTo(g,j+f,i+e,h,i,h);
      drawCtx.bezierCurveTo(i-e,h,a,j+f,a,j);
      drawCtx.closePath();
    }
    drawCtx.beginPath();
    _drawEllipse(drawRectX, drawRectY, drawRectW, drawRectH);
    drawCtx.stroke();
  }

  function drawArrow() {
    function drawPoly(points) {
      drawCtx.beginPath();
      drawCtx.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length; i++) {
        drawCtx.lineTo(points[i][0], points[i][1]);
      }
      drawCtx.lineTo(points[0][0], points[0][1]);
      drawCtx.fill();
    }
    function shift(points, dx, dy) {
      var d = [];
      for (var p in points) d.push([points[p][0] + dx, points[p][1] + dy]);
      return d;
    }
    function rotate(points, angle) {
      var c = [];
      for (var i in points) c.push(rotatePoint(angle, points[i][0], points[i][1]));
      return c;
    }
    function rotatePoint(angle, x, y) {
      return [x*Math.cos(angle) - y*Math.sin(angle),
              x*Math.sin(angle) + y*Math.cos(angle)];
    }

    drawLine();
    var arrowPoints = [[4, 0], [-10, -5.5], [-10, 5.5]];
    var angle = Math.atan2(startY - pointerY, startX - pointerX);
    drawPoly(shift(rotate(arrowPoints, angle), startX, startY));
  }

  function drawLine() {
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY);
    drawCtx.lineTo(pointerX, pointerY);
    drawCtx.stroke();
  }

  function onPointerMove(pageX, pageY) {
    if (!drawing) {
      $(drawCanvas).on("mouseup touchend", function() { onPointerUp(); });
      drawing = true;
    }

    drawCtx.clearRect(Math.max(0, drawRectX - 20), Math.max(0, drawRectY - 20),
                      drawRectW + 40, drawRectH + 40);
    pointerX = pageX - editOffsetX;
    pointerY = pageY - editOffsetY;
    drawRectX = Math.min(pointerX, startX);
    drawRectY = Math.min(pointerY, startY);
    drawRectW = Math.abs(pointerX - startX);
    drawRectH = Math.abs(pointerY - startY);
    drawCtx.strokeStyle = drawColor;
    drawCtx.fillStyle = drawColor;
    drawCtx.lineWidth = margin;

    switch (shape) {
      case "rectangle": drawRectangle(); break;
      case "ellipse": drawEllipse(); break;
      case "arrow": drawArrow(); break;
      case "line": drawLine(); break;
    }
  }

  function onPointerUp() {
    o.done();
    resultCb(cut(drawCanvas, shape, drawRectX, drawRectY, drawRectW, drawRectH, margin));
  }

  this.done = function() {
    $(drawCanvas).remove();
    $(showCanvas).removeClass("draw");
  }
  this.cancel = this.done;
  this.isUndoable = function() { return drawing; }
}

function FreeLineAction(resultCb) {
  return new freeLineOrHighlightAction(false /* isHighlight */, resultCb);
}

function HighLightAction(resultCb) {
  return new freeLineOrHighlightAction(true /* isHighlight */, resultCb);
}

function freeLineOrHighlightAction(isHighlight, resultCb) {
  var drawCanvas = $('<canvas>')
    .attr({id: isHighlight ? "highlight-canvas" : "free-line-canvas"})
    .css({left: 0, top: 0, width: showCanvas.width, height: showCanvas.height})
    .addClass(isHighlight ? "draw_text_highlight" : "draw_free_line")
    .insertAfter(showCanvas)[0];
  var drawCtx = drawCanvas.getContext("2d");

  var drawing = false;
  var paused = false;
  var isTouch = false;
  var drawRectMinX = showCanvas.width, drawRectMinY = showCanvas.height;
  var drawRectMaxX = 0, drawRectMaxY = 0;

  function updateRect(x, y) {
    if (x < drawRectMinX) drawRectMinX = x;
    if (x > drawRectMaxX) drawRectMaxX = x;
    if (y < drawRectMinY) drawRectMinY = y;
    if (y > drawRectMaxY) drawRectMaxY = y;
  }

  this.begin = function(pageX, pageY) {
    var startX = pageX - editOffsetX, startY = pageY - editOffsetY;
    doDraw(startX, startY);
    doDraw(startX + 1, startY + 1);
    drawing = true;
  }

  this.draw = function(pageX, pageY) {
    if (!drawing || paused) return;
    var toX = pageX - editOffsetX, toY = pageY - editOffsetY;
    doDraw(toX, toY);
  }

  function doDraw(toX, toY) {
    updateRect(toX, toY);
    if (this.lastX == null) drawCtx.moveTo(toX, toY);
    drawCtx.lineTo(toX, toY);
    this.lastX = toX;
    this.lastY = toY;
    drawCtx.lineJoin = "round";
    drawCtx.lineCap = "round";
    if (isHighlight) {
      drawCtx.strokeStyle = highlightColor;
      drawCtx.lineWidth = highlightWidth;
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      drawCtx.globalCompositeOperation = "lighter";
    } else {
      drawCtx.strokeStyle = drawColor;
      drawCtx.lineWidth = freeLineWidth;
    }
    drawCtx.stroke();
  };

  this.pause = function() {
    if (!drawing) return;
    paused = true;
    this.lastX = null;
    this.lastY = null;
  };

  this.resume = function() {
    if (!drawing) return;
    paused = false;
  };

  this.end = function(pageX, pageY) {
    if (!drawing) return;
    doDraw(pageX - editOffsetX, pageY - editOffsetY);
    drawing = false;
    paused = false;
    var result = cut(drawCanvas, isHighlight ? "text-highlight" : "free-line",
                 drawRectMinX, drawRectMinY,
                 drawRectMaxX - drawRectMinX,
                 drawRectMaxY - drawRectMinY,
                 isHighlight ? highlightWidth : freeLineWidth);
    this.done();
    resultCb(result);
  };

  this.done = function() { $(drawCanvas).remove(); }
  this.cancel = this.done;
  this.isUndoable = function() { return drawing; }

  var a = this;
  $(drawCanvas)
    .attr({width:editW, height:editH})
    .css({left:0, top:0, cursor:"url(../images/pen.png),auto !important"})
    .disableSelection().off("mousedown mouseup")
    .on("mousedown", function(e) { a.begin(e.pageX, e.pageY); })
    .on("mousemove", function(e) { a.draw(e.pageX, e.pageY); })
    .on("mouseout", function() { a.pause(); })
    .on("mouseenter", function(e) { if (e.buttons & 1) a.resume(); else a.end(); })
    .on("mouseup", function(e) { a.end(e.pageX, e.pageY); })
    .on("touchstart", function(e) {
      isTouch = true;
      var t = e.originalEvent.changedTouches[0];
      a.begin(t.pageX, t.pageY);
      e.originalEvent.preventDefault();
    })
    .on("touchmove", function(e) {
      var t = e.originalEvent.changedTouches[0];
      a.draw(t.pageX, t.pageY);
      e.originalEvent.preventDefault();
    })
    .on("touchend", function(e) {
      var t = e.originalEvent.changedTouches[0];
      a.end(t.pageX, t.pageY);
      e.originalEvent.preventDefault();
    });
};

function BlurAction(resultCb) {
  var o = this;
  var drawing = false;
  var blurCanvas = $('<canvas>')
    .attr({id: "blur-canvas", width: showCanvas.width, height: showCanvas.height})
    .insertAfter(showCanvas)[0];
  var drawCtx = blurCanvas.getContext("2d");
  drawCtx.drawImage(showCanvas, 0, 0);

  var drawRectMinX = showCanvas.width, drawRectMinY = showCanvas.height;
  var drawRectMaxX = 0, drawRectMaxY = 0;

  function updateRect(x, y) {
    if (x < drawRectMinX) drawRectMinX = x;
    if (x > drawRectMaxX) drawRectMaxX = x;
    if (y < drawRectMinY) drawRectMinY = y;
    if (y > drawRectMaxY) drawRectMaxY = y;
  }

  // rojer: I do not claim to understand what's going on here. Is this reversible?
  function mix(imgData) {
    var w = imgData.width;
    var h = imgData.height;
    var id = imgData.data;
    var k, step, jump, inner, outer, arr;
    k = step = jump = inner = outer = arr = 0;
    for (var l = 0; l < 2; l++) {
      if (l > 0) {
        outer = w;
        inner = h;
        step = 4 * w;
      } else {
        outer = h;
        inner = w;
        step = 4;
      }
      for (var c = 0; c < outer; c++) {
        jump = (l == 0) ? c * w * 4 : 4 * c;
        for (var e = 0; e < 3; e++) {
          k = jump + e;
          arr = id[k] + id[k + step] + id[k + 2 * step];
          id[k] = Math.floor(arr / 3);
          arr += id[k + 3 * step];
          id[k + step] = Math.floor(arr / 4);
          arr += id[k + 4 * step];
          id[k + 2 * step] = Math.floor(arr / 5);
          for (var d = 3; d < inner - 2; d++) {
            arr = Math.max(0, arr - id[k + (d - 2) * step] + id[k + (d + 2) * step]);
            id[k + d * step] = Math.floor(arr / 5);
          }
          arr -= id[k + (d - 2) * step];
          id[k + d * step] = Math.floor(arr / 4);
          arr -= id[k + (d - 1) * step];
          id[k + (d + 1) * step] = Math.floor(arr / 3);
        }
      }
    }
    return imgData;
  }

  function onPointerMove(pageX, pageY) {
    var c = pageX - editOffsetX;
    var d = pageY - editOffsetY;
    updateRect(c, d);
    imageData = drawCtx.getImageData(c, d, blurWidth, blurWidth);
    imageData = mix(imageData);
    var tc1 = document.createElement('canvas').getContext('2d');
    tc1.canvas.width = tc1.canvas.height = blurWidth;
    tc1.putImageData(imageData, 0, 0);
    var tc2 = document.createElement('canvas').getContext('2d');
    tc2.canvas.width = tc2.canvas.height = blurWidth;
    tc2.beginPath();
    tc2.arc(blurWidth / 2, blurWidth / 2, blurWidth / 2, 0, Math.PI*2, true);
    tc2.clip();
    tc2.drawImage(tc1.canvas, 0, 0);
    drawCtx.drawImage(tc2.canvas, c, d);
  }

  function onPointerUp() {
    o.done();
  }

  $(blurCanvas)
    .on("mousedown", function(e) { onPointerDown(e.pageX, e.pageY); })
    .on("touchstart", function(e) {
      var t = e.originalEvent.changedTouches[0];
      onPointerDown(t.pageX, t.pageY);
      e.originalEvent.preventDefault();
    });

  function onPointerDown(pageX, pageY) {
    drawing = true;
    onPointerMove(pageX, pageY);
    $(blurCanvas)
      .on("mousemove", function(e) { onPointerMove(e.pageX, e.pageY); })
      .on("touchmove", function(e) {
        var t = e.originalEvent.changedTouches[0];
        onPointerMove(t.pageX, t.pageY);
        e.originalEvent.preventDefault();
      })
      .on("mouseup touchend", function() { onPointerUp(); });
  }

  function cleanUp() {
    $(blurCanvas).remove();
  }

  this.done = function() {
    cleanUp();
    if (drawing) {
      drawing = false;
      var result = cut(blurCanvas, "blur",
                       drawRectMinX, drawRectMinY,
                       drawRectMaxX - drawRectMinX,
                       drawRectMaxY - drawRectMinY,
                       blurWidth);
      resultCb(result);
    }
  }
  this.cancel = cleanUp;
  this.isUndoable = function() { return drawing; }
}

function TextAction(resultCb) {
  var o = this;
  var input, oldText = "";
  var contrastBorderWidth = 1;
  var textCanvas = $('<canvas>')
    .attr({width: showCanvas.width, height: showCanvas.height})
    .insertAfter(showCanvas)
    .css({cursor: "text"})
    .on("click", function(e) {
      if (!input) {
        addInput(e.pageX - editOffsetX, Math.max(0, e.pageY - editOffsetY - 11));
        $(textCanvas).css({cursor: "auto"});
      } else {
        o.done();
      }
    })[0];
  var testLine = null;

  function addInput(x, y) {
    input = $('<textarea class="text-input" spellcheck="false"></textarea>')
      .attr({rows: 1})
      .css({color: drawColor /* this is only the cursor color, see CSS. */,
            width: "20px", height: "25px", left: x+"px", top: y+"px"})
      .insertAfter($(textCanvas))
      .autoGrow({maxWidth: editW - x, maxHeight: editH - y})
      .focus()
      .on("input", function(e) {
        var text = $(input).val();
        if (text != oldText) {
          renderText(input);
          oldText = text;
          updateUndoButton();
        }
      })
      .on("keypress", function(e) {
        if (e.which == 10 && e.ctrlKey && !e.altKey) { /* Ctrl-Enter */
          o.done();
          return false;
        }
      });
    testLine = $("<span>test</span>")
      .css({font: $(input).css("font"), border: "none", padding: 0})
      .css({position: "absolute", left: 0, top: 0, visibility: "hidden"})
      .insertAfter(input);
  }

  function renderText(input) {
    var lineH = $(testLine).height();
    var lines = $(input).val().split("\n");
    var textCtx = textCanvas.getContext("2d");
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    textCtx.font = $(input).css("font");
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (line == "") continue;
      var lineX = parseInt($(input).css("left"));
      var lineY = parseInt($(input).css("top")) + (li + 1) * lineH - 6;
      for (var i = 0; i < 16; i++) {
        textCtx.save();
        textCtx.translate(Math.cos(i * Math.PI / 8) * contrastBorderWidth,
                          Math.sin(i * Math.PI / 8) * contrastBorderWidth);
        textCtx.fillStyle = contrastColor;
        textCtx.fillText(line, lineX, lineY);
        textCtx.restore();
      }
      textCtx.fillStyle = drawColor;
      textCtx.fillText(line, lineX, lineY);
    }
  }

  function cleanUp() {
    if (input) $(input).remove();
    if (textCanvas) $(textCanvas).remove();
    if (testLine) $(testLine).remove();
    $(".autogrow-textarea-mirror").remove();
  }

  this.done = function() {
    var result = null;
    if (input && $(input).val() != "") {
      renderText(input);
      var lineH = $(testLine).height();
      result = cut(
          textCanvas, "text",
          parseInt($(input).css("left")), parseInt($(input).css("top")),
          $(".autogrow-textarea-mirror").width(), $(".autogrow-textarea-mirror").height(),
          contrastBorderWidth);
    }
    cleanUp();
    if (result) resultCb(result);
  }

  this.cancel = cleanUp;
  this.isUndoable = function() { return oldText != ""; }
}

function updateEditArea(){
  $editArea.css({width:editW+"px",height:editH+"px"});
  var wh = $(window).height();
  if (editH < wh - 88) {
    $editArea.addClass("small");
  } else {
    $editArea.removeClass("small");
  }
}

function updateShowCanvas(){
  $(showCanvas).attr({width:editW,height:editH})
}

function getEditOffset(){
  var a = $editArea.offset();
  editOffsetX = a.left;
  editOffsetY = a.top;
}

function getScrollbarWidth(){
  var a = document.createElement("p");
  a.style.width = "100%";
  a.style.height = "200px";
  var b = document.createElement("div");
  b.style.position = "absolute";
  b.style.top = "0px";
  b.style.left = "0px";
  b.style.visibility = "hidden";
  b.style.width = "200px";
  b.style.height = "150px";
  b.style.overflow = "hidden";
  b.appendChild(a);
  document.body.appendChild(b);
  var noScroll = a.offsetWidth;
  b.style.overflow = "scroll";
  var withScroll = a.offsetWidth;
  if (noScroll == withScroll) withScroll = b.clientWidth;
  var scrollWidth = (noScroll - withScroll);
  document.body.removeChild(b);
  return scrollWidth;
}

function getLocVersion(){
  var a=new XMLHttpRequest;return a.open("GET","./manifest.json",!1),a.send(null),JSON.parse(a.responseText).version
}

function addMargin(){
  editOffsetX||48!=editOffsetY&&88!=editOffsetY?$editArea.addClass("add-margin"):$editArea.removeClass("add-margin")
}

function isCrOS(){
  return-1!=navigator.appVersion.indexOf("CrOS")
}

function showInfo(a){
  if(a)var b='<div class="w-info" id="w-cpy-info"><div class="w-info-topBar"><div class="w-info-logo"></div><div>Awesome Screenshot</div></div><p>It has been announced that Chrome will no longer allow extensions to make use of NPAPI, and therefore extensions will no longer be able to provide "copy image to clipboard" feature.   The current "Copy" feature is a workaround. If It doesn\'t work for you, please follow the instruction below:</p><p>Right-click the image in the left pane, and then select "<b>Copy Image</b>". </p><div class="w-close-btn"></div></div>';else var b='<div class="w-info" id="w-cpy-info"><div class="w-info-topBar"><div class="w-info-logo"></div><div>Awesome Screenshot</div></div><p>Previously, Awesome screenshot  was able to make use of plugins through a standard plugin system called NPAPI. It has been <a href="http://blog.chromium.org/2013/09/saying-goodbye-to-our-old-friend-npapi.html" target="_blank">announced</a> that Chrome will no longer allow extensions to make use of NPAPI, and therefore extensions will no longer be able to provide "copy image to clipboard" feature. </p><p>After some hard work, we finally worked around this issue and enable the copy feature for you again. </p><p>We are sorry for this change.  If you like awesome screenshot, please <a href="https://chrome.google.com/webstore/detail/awesome-screenshot-captur/alelhddbbhepgpmgidjdcjakblofbmce/reviews">give it a nice 5-star rating</a>. Thanks for the support!</p><div class="w-close-btn"></div></div>';var c='<div class="w-wrapper"></div>',d=$(c).appendTo(document.body).css({visibility:"visible",opacity:1}),e=$(b).appendTo(document.body);e.find(".w-close-btn").on("click",function(){d.remove(),e.remove()})
}


var showCanvas,isPngCompressed=!1,isSavePageInit=!1,editOffsetX,editOffsetY,editW,editH,$editArea,actions=[],initFlag=1,requestFlag=1,uploadFlag=!1,showCanvas,showCtx;
var highlightWidth = 20, freeLineWidth = 4, blurWidth = 20;
var taburl,tabtitle,compressRatio=80,resizeFactor=100,shift=!1;
var lastH, lastW;
var drawColor = "red";
var contrastColor = "white";
var highlightColor = "rgba(255,0,0,.3)";
var currentAction = null;
var selectedTool = null;

window.addEventListener("resize",function(){getEditOffset()});

function showTip(text, onClose) {
  $("#tip-text").text(text);
  $("#tip")
    .on("click", function() {
      $("#tip").off("click");
      $("#tip").fadeOut("slow", onClose);
    })
    .show();
}

function maybeShowTouchTip() {
  if (navigator.maxTouchPoints > 0 && localStorage.tip_touch_shown != 1) {
    showTip("You can use touch to draw", function() {
      localStorage.tip_touch_shown = 1;
    });
  }
}

function handleReq(req) {
  if (requestFlag && req.userAction) {
    i18n();
    prepareEditArea(req);
    prepareTools();
    requestFlag = 0;
    maybeShowTouchTip();
  }
}

$(document).ready(function(){
  $editArea=$("#edit-area").disableSelection();
  showCanvas = document.getElementById("show-canvas");
  showCtx = showCanvas.getContext("2d");
  chrome.extension.onRequest.addListener(handleReq);
  bindShortcuts();
  $(window).unbind("resize").resize(function(){
    getEditOffset();
    addMargin();
  });
  if (window.location.hash.substr(0, 6) == "#test-") {
    var file = window.location.hash.substr(6);
    console.log('loading test image ' + file);
    $('<img id="test_image" src="http://localhost:8080/' + file + '" style="display:none">')
      .appendTo($('body'));
    $("#test_image").on("load", function() {
      var c = document.createElement("canvas");
      c.width = this.width;
      c.height = this.height;
      var ctx = c.getContext("2d");
      ctx.drawImage(this, 0, 0);
      var dataURL = c.toDataURL("image/png");
      $(this).remove();
      var req = {
        userAction: "upload",
        type: "visible",
        data: [dataURL],
        taburl: "http://dummy/",
        tabtitle: "test image",
        counter: 0,
        ratio: 0,
        scrollBar: 0,
        centerW: 0,
        centerH: 0,
        w: this.width,
        h: this.height,
        centerOffX: 0,
        centerOffY: 0
      };
      $(this).off("load");
      handleReq(req);
    });
  } else {
    chrome.extension.sendRequest({action:"edit_ready"});
  }
});

var Account={};

Account.initForm = function(){
  var a="https://www.diigo.com/account/thirdparty/openid?openid_url=https://www.google.com/accounts/o8/id&redirect_url="+encodeURIComponent(chrome.extension.getURL(""))+"&request_from=awesome_screenshot";
  var b='<div id="account" class="jqmWindow"><table><tr><td><div class="loginByGoogle"><strong>New to Diigo? Connect to diigo.com via</strong><a href="'+
        a+'" class="button" target="_blank">Google account</a></div></td></tr></table></div>';
  $(b).appendTo($("#saveOnline .content")).hide();
};

var SavePage={};

SavePage.getImageSrc = function() {
  return $("#save-image").attr("src").replace(/^data:image\/(png|jpeg);base64,/,"");
};

SavePage.getImageSrcAndType = function() {
  var m = $("#save-image").attr("src").match(/^data:(.+?\/(.+?));base64,(.+)/);
  return {mimeType: m[1], fileExt: m[2], srcBase64: m[3]};
};

SavePage.response=function(a,b){switch(a.status){case 200:var c=JSON.parse(a.response);1==c.code&&b(a);break;case 401:-1==JSON.parse(a.response).code&&$("#authError").jqm().jqmShow();break;default:$("#networkError").jqm().jqmShow()}$("#account").removeClass("authing")};

SavePage.responsea=function(a,b){switch(a.status){case 200:var c=JSON.parse(a.response);1==c.code&&b(a);break;case 401:-1==JSON.parse(a.response).code&&SavePage.signout();break;default:console.log("error")}$("#account").removeClass("authing")};

SavePage.request=function(a,b,c){var d="",e={},f={v:1,pv:1,cv:3,ct:"chrome_awesome_screenshot",url:"https://www.diigo.com/kree"};switch(a){case"signin":f.url="https://secure.diigo.com/kree";break;case"uploadItems":d="&image="+encodeURIComponent(SavePage.getImageSrc())}b=JSON.stringify(b),d="cv="+f.cv+"&ct="+f.ct+"&v="+f.v+"&cmd="+a+"&json="+encodeURIComponent(b)+"&s="+hex_md5(""+f.ct+f.cv+b+f.v+a)+d,e=new XMLHttpRequest,e.open("POST",f.url+("/pv="+f.pv+"/ct="+f.ct),!0),e.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),e.setRequestHeader("X-Same-Domain","true"),e.onreadystatechange=function(){4==this.readyState&&(SavePage.response(e,c),e=null)},e.send(d)};

SavePage.requesta=function(a,b,c){var d="",e={},f={v:1,pv:1,cv:3,ct:"chrome_awesome_screenshot",url:"https://www.diigo.com/kree"};switch(a){case"signin":f.url="https://secure.diigo.com/kree";break;case"uploadItems":d="&image="+encodeURIComponent(SavePage.getImageSrc())}b=JSON.stringify(b),d="cv="+f.cv+"&ct="+f.ct+"&v="+f.v+"&cmd="+a+"&json="+encodeURIComponent(b)+"&s="+hex_md5(""+f.ct+f.cv+b+f.v+a)+d,e=new XMLHttpRequest,e.open("POST",f.url+("/pv="+f.pv+"/ct="+f.ct),!0),e.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),e.setRequestHeader("X-Same-Domain","true"),e.onreadystatechange=function(){4==this.readyState&&(SavePage.responsea(e,c),e=null)},e.send(d)};

SavePage.updateUserInfo=function(){if(localStorage.user_info){var a=JSON.parse(localStorage.user_info).info.username;$("#accountInfo .name").attr("href","https://www.diigo.com/user/"+a+"?type=image").html(a),$("#saveOptionContent>.diigo").addClass("signin");var b=JSON.parse(localStorage.user_info).permission;b.is_premium||b.image?($(".diigo .saveForm").show(),$(".premium").hide()):($(".diigo .saveForm").hide(),$(".premium").show())}else $("#saveOptionContent>.diigo").removeClass("signin"),$(".share, .saveForm, .premium",$(".diigo")).hide()};

SavePage.handleUserInfo=function(a){localStorage.user_info=JSON.stringify(JSON.parse(a.response).result),SavePage.updateUserInfo()};

SavePage.loadUserInfo=function(a,b){SavePage.requesta("loadUserInfo",{user_id:a},function(a){b?b(a):SavePage.handleUserInfo(a)})};

SavePage.signout=function(){var a=document.createElement("script");a.setAttribute("src","https://www.diigo.com/sign-out"),document.body.appendChild(a),localStorage.user_info="",SavePage.updateUserInfo()};

SavePage.loginByGoogle=function(){chrome.extension.onRequest.addListener(function(a){switch(a.name){case"loginByGoogle":SavePage.request("syncItems",{folder_server_id_1:[]},function(a){chrome.extension.onRequest.removeListener(),SavePage.loadUserInfo(JSON.parse(a.response).user_id)})}})};

SavePage.loginByDiigo=function(){function a(){var a=!1;return b&&c?a=!0:b&&!c?$("#account input[name=password]").focus().addClass("empty"):!b&&c?$("#account input[name=username]").focus().addClass("empty"):($("#account input[name=username]").focus().addClass("empty"),$("#account input[name=password]").addClass("empty")),a
}var b=$('#account .loginByDiigo input[name="username"]').val(),c=$('#account .loginByDiigo input[name="password"]').val();a()&&($("#account").addClass("authing"),SavePage.request("signin",{user:b,password:c},function(a){SavePage.handleUserInfo(a)}))};

SavePage.initAccount=function(){localStorage.user_info?SavePage.loadUserInfo(JSON.parse(localStorage.user_info).info.user_id):SavePage.updateUserInfo(),$(".loginByGoogle .button").click(SavePage.loginByGoogle),$(".loginByDiigo .button").click(SavePage.loginByDiigo),$("body").keyup(function(a){$(a.target).hasParent(".loginByDiigo")&&13===a.keyCode&&SavePage.loginByDiigo()})};

SavePage.showUploadResponse=function(a,b){function c(){$(".socialButton, .emailButton",$("."+a)).click(function(a){$(a.target).addClass("visited")}).find("a").each(function(){var a=this;$(a).hasClass("weibo")?a.href+="&url="+encodeURIComponent(d)+"&appkey=4237332164&title=&pic=&ralateUid=":$(a).hasClass("twitter")?a.href="http://twitter.com/share?url="+encodeURIComponent(d)+"&via=awe_screenshot&text="+tabtitle:$(a).attr({href:a.href+d})}),$(".shareLink",$("."+a)).find("input[type=text]").val(d).bind("mouseup",function(){$(this).select()})}$(".loader").remove();var d="";"diigo"===a?$("#privacy").is(":checked")?(d=b.url,$(".diigo .privateLink").attr({href:d}),$(".share",$("."+a)).removeClass("public").addClass("private")):(d=b.image_share_url,c(),$(".share",$("."+a)).removeClass("private").addClass("public")):(d=b.url,c()),$(".share",$("."+a)).show(400)};

SavePage.uploadImageToAS=function(){$(".as .saveForm").hide("fast").after($('<div class="loader">Uploading</div>'));var a="",b={},c={pv:"1.0",cv:getLocVersion(),ct:"chrome",cmd:"imageUpload",url:"http://awesomescreenshot.com/client?"},d=SavePage.getImageSrc();a=JSON.stringify({src_url:taburl,src_title:tabtitle,image_md5:hex_md5(d),image_type:"png",image_content:d}),b=new XMLHttpRequest,b.open("POST",c.url+"cmd="+c.cmd+"&pv="+c.pv+"&ct="+c.ct+"&cv="+c.cv,!0),b.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),b.setRequestHeader("X-Same-Domain","true"),b.onreadystatechange=function(){4==this.readyState&&(SavePage.response(b,function(a){SavePage.showUploadResponse("as",JSON.parse(a.response).result)}),b=null)},b.send(a)};

SavePage.uploadImageToDiigo=function(){$(".diigo .saveForm").hide("fast").after($('<div class="loader">Uploading</div>'));var a={items:[{local_id:"image",server_id:-1,cmd:1,type:2,local_file_md5:hex_md5(SavePage.getImageSrc()),tags:$(".diigo input[name=tags]").val(),mode:$("#privacy").is(":checked")?2:0,title:$(".diigo input[name=title]").val()||tabtitle,src_url:/http:|https:|ftp:/.test(taburl)?taburl:"",src_title:tabtitle}]};SavePage.loadUserInfo(JSON.parse(localStorage.user_info).info.user_id,function(b){var c=JSON.parse(b.response).result,d=c.permission;localStorage.user_info=JSON.stringify(c),(d.is_premium||d.image)&&SavePage.request("uploadItems",a,function(a){SavePage.showUploadResponse("diigo",JSON.parse(a.response).result.items[0])})})};

SavePage.setPublicGdrive = function(fileId, authToken) {
  if (!authToken) return;
  var setPermissionsRequest = new XMLHttpRequest;
  setPermissionsRequest.open("POST", "https://www.googleapis.com/drive/v2/files/" + fileId + "/permissions");
  setPermissionsRequest.setRequestHeader("Authorization", "OAuth " + authToken);
  setPermissionsRequest.setRequestHeader("Content-Type", "application/json");
  setPermissionsRequest.send(JSON.stringify({ role: "reader", type: "anyone" }));
};

/**
* Takes the users Google Drive folders, and lists them in an
* HTML <select> tag so the user can choose which folder to save the screenshot
* @author   joshkayani@gmail.com
* @param  currentFolder  An object in the form {name: Folder-Name, id: Folder-ID}. Used to represent the folder currently being browsed
* @param  parentChain  An array of objects in the same format as currentFolder, used to keep track of the "chain" of ancestor folders
* @param  up     A boolean describing whether we're recursively ascending or descending the file tree (true for ascending)
*/
SavePage.getGDriveFolders = function(currentFolder, parentChain, up){

  // Get read-only OAuth permissions to view the users GDrive folders
  var authDetails = {'interactive': true, 'scopes': ['https://www.googleapis.com/auth/drive.readonly']};
  var recentParent = parentChain[parentChain.length - 1];

  chrome.identity.getAuthToken(authDetails, function(authToken){
    $.ajax({
      url: "https://www.googleapis.com/drive/v2/files",

      type: "get",

      data: {
        corpus: "DEFAULT",
        q: "('" + currentFolder["id"] + "'" + " in parents) and (mimeType='application/vnd.google-apps.folder') and (trashed=false)",
        spaces: "drive",
        fields: "items",
        maxResults: 1000
      },

      headers: {
        "Authorization": "OAuth " + authToken,
      },

      // Once we're given permission, populate the folder select dropdown
      success: function(response){
        var title, id;
        var options = $(".gdrive-folder-select");

        // Add an option to go up a level in the folder tree,
        // as long we're currently not in the absolute root
        if (currentFolder["id"] != "root")
          options.append("<option class='up' value='" + recentParent["id"] + "'>" + recentParent["name"] + "</option>");

        // Sort the folders into alphabetical order
        response["items"] = response["items"].sort(function (a, b){
          if (a["title"] > b["title"]){
            return 1;
          }
          else{
            return -1;
          }
        });

        // For each folder, add an <option id=FOLDERID>FOLDERTITLE</option>
        for (var i = 0; i < response["items"].length; i++){
          title = response["items"][i]["title"];
          id = response["items"][i]["id"];
          options.append("<option value='" + id + "'>" + title + "</option>");
        }

        // Add an option to use the root of the current folder
        options.append("<option selected class='no-recursion' value='" + currentFolder["id"] + "'>" + currentFolder["name"] + "</option>");

        // Remove previous change() events
        options.unbind();

        options.change(function(){
          var selectedFolderName = options.children("option:selected").text();
          var selectedFolderID   = options.val();
          var up                 = options.children("option:selected").hasClass("up");

          // Folder traversing is only done if the selected folder isn't a "root"
          if (!options.children("option:selected").hasClass("no-recursion")){

            // Clear the list of folders
            options.empty();

            // If we're going up a folder, we should remove latestParent from the parentChain
            if (up){
              parentChain.pop();
            }

            // If we're going down a folder, we should add the current folder to the parentChain
            // before descending a level in the tree
            else{
              parentChain.push(currentFolder);
            }

            SavePage.getGDriveFolders({name: selectedFolderName, id: selectedFolderID}, parentChain, up);
          }
        });

      },

      // For error handling
      statusCode: {
        401: function(){
          $("#GauthError").jqm().jqmShow();
          $("#gdrive-save-form").show();
        }
      }
    });
  });
};

// Make the initial call
SavePage.getGDriveFolders({name: "My Drive", id: "root"}, [{name: "My Drive", id: "root"}], false);

SavePage.saveToGdrive = function() {
  var imageName = $("#gdrive-image-name").val();
  var isPublic = (0 == $("#gdrive-private").prop("checked"));
  var authDetails = {'interactive': true, 'scopes': ['https://www.googleapis.com/auth/drive.file']};
  chrome.identity.getAuthToken(authDetails, function(authToken) {
    console.log('token:', authToken);
    if (!authToken) return;
    var multipartBoundaryString = "287032381131322";
    var uploadRequest = new XMLHttpRequest;
    uploadRequest.open("POST", "https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart");
    uploadRequest.setRequestHeader("Authorization", "OAuth " + authToken);
    uploadRequest.setRequestHeader("Content-Type", 'multipart/mixed; boundary="' + multipartBoundaryString + '"');
    uploadRequest.onreadystatechange = function() {
      if (this.readyState != 4) return;
      uploadFlag = false;
      $(".loader").remove();
      switch (uploadRequest.status) {
        case 200: {
          var uploadResponse = JSON.parse(uploadRequest.response);
          if (uploadResponse.alternateLink) {
            var imageLink = uploadResponse.alternateLink;
            if (isPublic) {
              SavePage.setPublicGdrive(uploadResponse.id, authToken);
            } else {
              $("#gdrive-share-link p").text("Image Link (Private, only you can view it.)");
            }
            $(".loader").remove();
            $("#gdrive-user").show();
            $("#gdrive-share-link").show();
            $("#gdrive-image-link").val(imageLink).focus().select();
            $("#gdrive-short-link").unbind().prop("checked", false);
            var shortImageLink;
            $("#gdrive-short-link").bind("change", function(){
              var checkbox = this;
              if (checkbox.checked) {
                if (shortImageLink) {
                  $("#gdrive-image-link").val(shortImageLink).focus().select();
                } else {
                  checkbox.disabled = true;
                  var authDetails = {'interactive': true, 'scopes': ['https://www.googleapis.com/auth/urlshortener']};
                  chrome.identity.getAuthToken(authDetails, function(authToken) {
                    console.log('token:', authToken);
                    if (!authToken) return;
                    $("#gdrive-share-link label").after(
                      $('<div class="loader" id="gdrive-short-link-loader">Loading...</div>'));
                    var shortURLRequest = new XMLHttpRequest;
                    shortURLRequest.open("POST", "https://www.googleapis.com/urlshortener/v1/url");
                    shortURLRequest.setRequestHeader("Authorization", "OAuth " + authToken);
                    shortURLRequest.setRequestHeader("Content-Type", "application/json");
                    shortURLRequest.onreadystatechange = function() {
                      if (this.readyState != 4) return;
                      checkbox.disabled = false;
                      $(".loader").remove();
                      if (this.status == 200) {
                        var shortURLResponse = JSON.parse(this.response);
                        shortImageLink = shortURLResponse.id;
                        $("#gdrive-image-link").val(shortImageLink).focus().select();
                      } else {
                        $("#networkError").jqm().jqmShow();
                        checkbox.checked = false;
                      }
                    };
                    shortURLRequest.send(JSON.stringify({longUrl: imageLink}));
                  });
                }
              } else {
                $("#gdrive-image-link").val(imageLink).focus().select();
              }
            });
          }
          break;
        }
        case 401: {
          $("#GauthError").jqm().jqmShow();
          $("#gdrive-save-form").show();
          break;
        }
        default: {
          $("#networkError").jqm().jqmShow();
          $("#gdrive-save-form").show();
        }
      }
    };
    var imageInfo = SavePage.getImageSrcAndType();

    var fileMetadata = {
      title: imageName + "." + imageInfo.fileExt,
      mimeType: imageInfo.mimeType,
    parents: [{
      kind: "drive#fileLink",
      id: $(".gdrive-folder-select").val()
    }]
    };
    var partBoundary = "--" + multipartBoundaryString;
    var lastBoundary = "--" + multipartBoundaryString + "--";
    var uploadRequestBodyLines = [
      partBoundary,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(fileMetadata),
      partBoundary,
      "Content-Type: " + imageInfo.mimeType,
      "Content-Transfer-Encoding: base64",
      "",
      imageInfo.srcBase64,
      lastBoundary
    ];
    var uploadRequestBody = uploadRequestBodyLines.join("\r\n");
    console.log("Upload request size: " + uploadRequestBody.length);
    uploadRequest.send(uploadRequestBody);
    uploadFlag = true;
    $("#gdrive-save-form").hide("fast").after($('<div class="loader">Uploading</div>'));
  });
};

SavePage.saveLocal=function(){
  function a(a,b,c){
    function d(a){return a.charCodeAt(0)};
    b=b||"";
    c=c||1024;
    for(var e=atob(a),f=[],g=0;g<e.length;g+=c){
      var h=e.slice(g,g+c);
      var i=Array.prototype.map.call(h,d);
      var j=new Uint8Array(i);
      f.push(j);
    }
    var k=new Blob(f,{type:b});
    return k;
  }
  try{}catch(b){  // ???
    console.log(b);
    var c=document.getElementById("save-image").src;
    var d=c.split(",")[1];
    var e=c.split(",")[0].split(":")[1].split(";")[0];
    var f=a(d,e);
    var g=(window.webkitURL||window.URL).createObjectURL(f);
    var h=document.createElement("a");
    var i=document.createEvent("MouseEvents");
    i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,0,null);
    h.setAttribute("href",g);
    h.setAttribute("download",tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," ")+"."+e.split("/")[1]);
    h.dispatchEvent(i);
  }
};

SavePage.copy = function(){
  try {
    var a=$('<div contenteditable="true"></div>')
      .css({height:"500px",width:"500px",position:"absolute"})
      .appendTo(document.body)
      .append($("#save-image").clone())
      .append("test")
      .focus();
    var b=document.createRange();
    b.selectNode(a[0]);
    var c=window.getSelection();
    c.removeAllRanges();
    c.addRange(b);
    document.execCommand("Copy",!1,null);
    a.remove();
    $(".copy_success").show(0).delay(3e3).fadeOut("slow");
  } catch(d) {
    console.log(d);
    $(".copy_unsupport").show(0).delay(3e3).fadeOut("slow");
  }
};

SavePage.print=function(){var a=$("#print_area").html(),b=document.createElement("IFRAME");$(b).attr({style:"position:absolute;width:0px;height:0px;left:-500px;top:-500px;",id:"print"}),document.body.appendChild(b);var c='<div style="margin:0 auto;text-align:center">'+a+"</div>",d=b.contentWindow.document;d.write(c);var e=b.contentWindow;e.close(),e.focus(),e.print(),$("iframe#print").remove()};

SavePage.initSaveOption = function(){
  var a='<div class="share"></div>';
  var b='<div class="socialButton"><a class="twitter" href="http://twitter.com/home?status=" target="_blank"><span></span>Twitter</a><a class="facebook" href="http://www.facebook.com/sharer.php?u=" target="_blank"><span></span>Facebook</a><a class="weibo" href="http://service.weibo.com/share/share.php?" target="_blank"><span></span>Weibo</a></div>';
  var c='<div class="emailButton"><a class="gmail" href="https://mail.google.com/mail/?view=cm&amp;tf=0&amp;fs=1&amp;body=" target="_blank"><span></span>Gmail</a><a class="yahoo" href="http://compose.mail.yahoo.com/" target="_blank"><span></span>Yahoo mail</a><a class="hotmail" href="http://www.hotmail.msn.com/secure/start?action=compose&amp;body=" target="_blank"><span></span>Hotmail</a></div>';
  var d='<div class="shareLink"><p>Image Link (share via MSN, GTalk, etc.)</p><input type="text" /></div>';
  var e='<a href="" class="privateLink" target="_blank">See screenshot on diigo.com</a>';

  $(a).html(b+c+d+e).prependTo($("#saveOptionContent .diigo")).hide();
  $(a).html(b+c+d).prependTo($("#saveOptionContent .as")).hide();
  $(".diigo .saveForm input[name=title]").val(tabtitle);
  $("#gdrive-image-name").val(tabtitle);
  $("#gdrive-user p span").bind("click",function(){$("#notice").show()});

  chrome.identity.getProfileUserInfo(function(userInfo) {
    $("#gdrive-user").show();
    $("#gdrive-user p span").text(userInfo.email);
    $("#saveOptionList li.sgdrive span").text("(" + userInfo.email + ")");
  });

  $(".diigo .saveForm input[name=tags]").val(chrome.extension.getBackgroundPage().recommendedTags);

  $("#saveOptionHead .back").click(function(){
    setTimeout(function(){
      $("#saveOptionContent>li.selected").removeClass("selected");
    }, 200);
    $("#saveOptionHead, #saveOptionBody").removeClass("showContent");
    $("#saveLocal").show();
  });

  $("#saveLocal").click(function(a){
    var b = a.target;
    if ($(b).hasClass("button")) {
      if ($(b).hasParent(".save_button")) {
        SavePage.saveLocal();
      } else if ($(b).hasParent(".copy_button")) {
        SavePage.copy();
      } else if ($(b).hasParent(".print_button")) {
        SavePage.print();
      }
    }
  });

  $(".signout").click(function(){SavePage.signout()});

  $(".btnDark").click(function(a){
    if ($(a.target).hasParent("#authError")) {
      $("#saveOptionContent>.diigo").removeClass("signin");
    } else if ("clear-authentication" == a.target.id) {
      $(".loader").remove();
      $("#gdrive-save-form").show();
      $("#gdrive-save-button").text("Connect and Save");
      $("#notice").hide();
      $("#gdrive-user").hide();
      $("#gdrive-user span").text("");
    }
  });

  $("#saveOptionList").click(function(a){
    var b = a.target;
    if ($(b).hasParent("#saveOptionList")) {
      $("#saveOptionContent").find("." + b.className).addClass("selected");
      $("#saveOptionHead, #saveOptionBody").addClass("showContent");
      $("#saveLocal").hide();
    }
  });

  $(".sgdrive span").click(function(){
    $("#saveOptionContent").find(".sgdrive").addClass("selected");
    $("#saveOptionHead, #saveOptionBody").addClass("showContent");
    $("#saveLocal").hide();
  });

  $("#gdrive-signout").click(function(a){
    var b = a.target;
    if ($(b).hasClass("jqmClose")) {
      $(".loader").remove();
      $("#gdrive-save-form").show();
    }
    $("#gdrive-save-button").text("Connect and Save");
    $("#notice").hide();
    $("#gdrive-user").hide();
    $("#saveOptionList li.sgdrive span").text("");
  });

  $("#saveOptionContent").click(function(a){
    if ($(a.target).hasClass("save")) {
      if ($(a.target).hasParent(".diigo")) {
        SavePage.uploadImageToDiigo();
      } else if ($(a.target).hasParent(".as")) {
        SavePage.uploadImageToAS();
      } else if ("gdrive-save-button" == a.target.id) {
        SavePage.saveToGdrive();
      } else if ("gdrive-connect" == a.target.id) {
        SavePage.authorizeGdrive();
      } else if ($(a.target).hasParent(".local")) {
        SavePage.saveLocal();
      }
    }
  });
};

SavePage.init = function(){
  SavePage.initSaveOption();
  SavePage.initAccount();
  $("#open-path").click(function(){SavePage.openSavePath()});
  $("#w-cpy").on("click",function(a){a.preventDefault(),showInfo()});
  $("#c-tip").on("click",function(a){a.preventDefault(),showInfo(!0)});
};

chrome.extension.sendRequest({action:"close_popup"});
