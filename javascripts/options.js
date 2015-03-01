function buildSelect() {
  for(var a=["V","S","E"],b=$('<select disabled="disabled"></select>'),c=48;91>c;c++)if(!(c>57&&65>c)){var d=String.fromCharCode(c);$("<option></option>").attr({value:d}).text(d).appendTo(b)}b.appendTo($(".select")).each(function(b){this.value=a[b]});
}

function bindSelect() {
  $("#shortcuts_table").click(function(a){var b=a.target,c=$(b).parent().siblings("td");if("SELECT"==b.tagName&&$("input",c).attr("checked")&&$("select",$("#menu_shortcuts")).not(b).each(function(){$("option[disabled]",$(this)).removeAttr("disabled"),$("option[value="+this.value+"]",$(b)).attr({disabled:"disabled"})}),"checkbox"==b.type){var d=$("select",c);$(b).attr("checked")?d.removeAttr("disabled"):d.attr({disabled:"disabled"})}});
}

function bindActionPanel() {
  $("#action_panel").click(function(a){if("INPUT"==a.target.tagName)switch(a.target.value){case"Reset":localStorage.clear(),localStorage.reset=!0,location.href=location.href,localStorage.msObj='{"visible":{"enable":true,"key":"V"},"selected":{"enable":true,"key":"S"},"entire":{"enable":true,"key":"E"}}',localStorage.format="png",localStorage.savePath="C:/",localStorage.autoSave="false";break;case"Save":if(checkDuplicateKeys())return $("#tip").addClass("error"),void showTip("Shortcut Keys Conflict");saveOptions(),$("#tip").removeClass("error"),showTip("Options Saved");break;case"Close":chrome.extension.sendRequest({action:"exit"})}});
}

function saveOptions() {
  localStorage.format=$('input[name="format"]:checked').attr("id");
  localStorage.delay_sec=$('input[name="delay_sec"]:checked').attr("data-sec");
  localStorage.autoSave=$("#autosave").is(":checked");
  localStorage["data-tracking"]=$("#data-tracking").is(":checked");
  var a={};
  $("input:checkbox", $("#menu_shortcuts")).each(function(){
    var b=this.id,c=this.checked,d=$("select",$(this).parent().siblings("td.select")).attr("value");
    a[""+b] = {enable:c, key:d};
  });
  $("input:checkbox", $("#menu_features")).each(function(){
    var b=this.id,c=this.checked,d=$("select",$(this).parent().siblings("td.select")).attr("value");
    a[""+b] = {enable:c, key:d};
  });
  localStorage.msObj=JSON.stringify(a);
  chrome.extension.sendRequest({action:"update_shortcuts"});
}

function restoreOptions(){
  if (!localStorage.format) localStorage.format = "png";
  $("#"+localStorage.format).attr({checked:"checked"}).siblings("input:checked").removeAttr("checked");

  if (!localStorage.delay_sec) localStorage.delay_sec = "3";
  $("#delay_sec_"+localStorage.delay_sec).attr({checked:"checked"}).siblings("input:checked").removeAttr("checked");
  "true"==localStorage["data-tracking"]&&$("#data-tracking").attr({checked:"checked"});
  localStorage.savePath&&$("#filePath").val(localStorage.savePath);
  if ("true"==localStorage.autoSave) $("#autosave").prop("checked", true);
  msObj = localStorage.msObj;
  if (msObj) {
    msObj = JSON.parse(msObj);
    for(var a in msObj){
      var b=msObj[a];
      var c=$("#"+a);
      var d=$("select",c.parent().siblings("td.select"));
      b.enable&&(c.attr({checked:"checked"}),d.removeAttr("disabled"));
      d.attr({value:b.key});
    }
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

function showTip(a){
  $("#tip").slideDown("fast").delay(2e3).fadeOut("slow").find("span").text(a);
}

var Bg=chrome.extension.getBackgroundPage();

$(document).ready(function(){
  localStorage.reset&&"true"==localStorage.reset&&(showTip("Options Reseted"),localStorage.removeItem("reset"));
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
