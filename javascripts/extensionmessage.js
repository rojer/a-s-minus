function sendsettingtoother(a){
  chrome.extension.sendRequest(AW_ID,{action:"setoption",key:a},function(a){console.log(a.message)});
  chrome.extension.sendRequest(QN_ID,{action:"setoption",key:a},function(a){console.log(a.message)});
  chrome.extension.sendRequest(RLF_ID,{action:"setoption",key:a},function(a){console.log(a.message)});
}
  
function getsettingformother(){
  chrome.extension.sendRequest(AW_ID,{action:"getoption"},function(a){"false"==a.key&&Prefs.set({"prefs.SearchO":!1})});
  chrome.extension.sendRequest(QN_ID,{action:"getoption"},function(a){"false"==a.key&&Prefs.set({"prefs.SearchO":!1})});
  chrome.extension.sendRequest(RLF_ID,{action:"getoption"},function(a){"false"==a.key&&Prefs.set({"prefs.SearchO":!1})});
}

var RLF_ID="decdfngdidijkdjgbknlnepdljfaepji", AW_ID="alelhddbbhepgpmgidjdcjakblofbmce", QN_ID="mijlebbfndhelmdpmllgcfadlkankhok", DIIGO_ID="oojbgadfejifecebmdnhhkbhdjaphole";

chrome.extension.onRequestExternal.addListener(function(a,b,c){
  switch(a.action){
    case "getoption": c({key:key});break;
    case "setoption": c({message:"Awesome Screenshot is Done"});
  };
});
