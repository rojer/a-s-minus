function buildSelect() {
  var select = $('<select disabled="yes"></select>');
  for (var c = 48; c < 91; c++) {
    if (!(c > 57 && c < 65)){
      var d = String.fromCharCode(c);
      $("<option></option>").attr({value:d}).text(d).appendTo(select);
    }
  }
  select.appendTo($(".select")).each(function(i){
    this.value = ["V", "S", "E"][i];
  });
}

function bindSelect() {
  $("#shortcuts_table").click(function(a){
    var b = a.target;
    var c = $(b).parent().siblings("td");
    if ("SELECT" == b.tagName && $("input",c).attr("checked")) {
      $("select", $("#menu_shortcuts")).not(b).each(function(){
        $("option[disabled]",$(this)).removeAttr("disabled");
        $("option[value="+this.value+"]",$(b)).attr({disabled:"disabled"});
      });
    }
    if ("checkbox" == b.type) {
      var d = $("select", c);
      if (b.checked) {
        d.removeAttr("disabled");
      } else {
        d.attr({disabled:"disabled"});
      }
    }
  });
}

function bindActionPanel() {
  $("#action_panel").click(function(a){
    if ("INPUT" != a.target.tagName) return;
    switch (a.target.id) {
      case "reset": {
        localStorage.clear();
        localStorage.reset = true;
        location.href = location.href;
        break;
      }
      case "save": {
        if (checkDuplicateKeys()) {
          $("#tip").addClass("error");
          showTip("Shortcut Keys Conflict");
          return;
        }
        saveOptions();
        $("#tip").removeClass("error");
        showTip("Options Saved", function() {
          chrome.extension.sendRequest({action:"exit"});
        });
        break;
      }
      case "close": {
        chrome.extension.sendRequest({action:"exit"});
        break;
      }
    }
  });
}

function saveOptions() {
  localStorage.format=$('input[name="format"]:checked').attr("id");
  localStorage.delay_sec=$('input[name="delay_sec"]:checked').attr("data-sec");
  localStorage.autoSave=$("#autosave").is(":checked");
  var a={};
  $("input:checkbox", $("#menu_shortcuts")).each(function(){
    var b = this.id;
    var c = this.checked;
    var d = $("select", $(this).parent().siblings("td.select")).prop("value");
    a[""+b] = {enable:c, key:d};
  });
  console.log(a.visible.key);
  localStorage.msObj = JSON.stringify(a);
  chrome.extension.sendRequest({action:"update_shortcuts"});
}

function restoreOptions(){
  if (!localStorage.format) localStorage.format = "png";
  $("#"+localStorage.format).attr({checked:"checked"}).siblings("input:checked").removeAttr("checked");

  if (!localStorage.delay_sec) localStorage.delay_sec = "3";
  $("#delay_sec_"+localStorage.delay_sec).attr({checked:"checked"}).siblings("input:checked").removeAttr("checked");
  localStorage.savePath&&$("#filePath").val(localStorage.savePath);
  if ("true"==localStorage.autoSave) $("#autosave").prop("checked", true);
  if (!localStorage.msObj) {
    localStorage.msObj = '{"visible":{"enable":true,"key":"V"},"selected":{"enable":true,"key":"S"},"entire":{"enable":true,"key":"E"}}';
  }
  var msObj = JSON.parse(localStorage.msObj);
  for (var a in msObj){
    var b = msObj[a];
    var c = $("#"+a);
    var d = $("select",c.parent().siblings("td.select"));
    if (b.enable) {
      c.attr({checked:"checked"});
      d.removeAttr("disabled");
    }
    d.prop({value:b.key});
  }
}
  
function checkDuplicateKeys(){
  var a="",b=0;
  $("select",$("td.select")).each(function(){
    var c=this.value;
    a+=c;
    a.match(new RegExp(c,"gi")).length > 1 && (b=1);
  });
  return b;
}

function showTip(a, cb){
  $("#tip").slideDown("fast").delay(2e3).fadeOut("slow", cb).find("span").text(a);
}

var Bg=chrome.extension.getBackgroundPage();

$(document).ready(function(){
  if (localStorage.reset && "true" == localStorage.reset) {
    showTip("Options reset");
    localStorage.removeItem("reset");
  }
  var a = document.getElementById("pluginobj");
  buildSelect();
  restoreOptions();
  bindSelect();
  bindActionPanel();
  $("#browsePath").on("click",function(){
    a.SetSavePath(localStorage.savePath,function(a){$("#filePath").val(a),localStorage.savePath=a},"Browse...");
  });
  $("#goToFolder").on("click",function(){
    a.OpenSavePath(localStorage.savePath);
  });
});
