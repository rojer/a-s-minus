function handleFileDrop(a){
  a.stopPropagation();
  a.preventDefault();
  var b=a.dataTransfer.files[0];
  readFile(b);
}

function handleFileSelect(a){
  a.stopPropagation();
  a.preventDefault();
  var b=a.target.files[0];
  readFile(b);
}

function readFile(a){
  var fileName = a.name.match(/(.*)\.(png|jpg|jpeg)$/i)[1];
  var reader = new FileReader;
  reader.onload = function(a){
    var data = a.target.result;
    chrome.extension.sendRequest({action:"upload", title:fileName, data:data});
  };
  reader.readAsDataURL(a);
}

function handleDragHover(a){
  a.stopPropagation();
  a.preventDefault();
  a.dataTransfer.dropEffect="move";
  dropZone.className="dragover"==a.type?"hover":"";
}

document.getElementById("image_file").addEventListener("change",handleFileSelect,!1);

var dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover",handleDragHover,!1);
dropZone.addEventListener("dragleave",handleDragHover,!1);
dropZone.addEventListener("drop",handleFileDrop,!1);
document.body.addEventListener("dragover",function(a){
  console.log("ddf");
  a.stopPropagation();
  a.preventDefault();
  a.dataTransfer.dropEffect="none";
}, !1);
