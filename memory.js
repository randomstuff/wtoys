/*
Copyright (c) 2013 Gabriel Corona <gabriel.corona@enst-bretagne.fr>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

// ***** Polyfill/compatibility

if(!window.console) {
  (function() {
    var noop = function() {}
    window.console = noop;
  })();
 }

if(!navigator.getUserMedia) {
  navigator.getUserMedia = 
    navigator.webkitGetUserMedia ||
    navigator.mozgetUserMedia ||
    navigator.msGetUserMedia;
 }

// ***** Helpers

var Helpers = {};
Helpers.dropzone = function(element, callback) {
  element.ondragenter = element.ondragover = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    return false;
  }
  element.ondrop = function(e) {
    e.preventDefault();
    callback(e.dataTransfer);
  }
};

Helpers.parseUriList = function(list) {
  var lines = list.split(/[\r\n]/);
  
  return lines.
  map(function(x){ return x.trim(); }).
  filter(function(x) { return x.length!=0 && !x[0]!="#"; })
};

Helpers.fitImage = function(img) {
  var wc = img.parentElement.clientWidth;
  var hc = img.parentElement.clientHeight; 
  
  var w = img.naturalWidth;
  var h = img.naturalHeight;

  if(h*wc/w > hc) {
    img.height = hc;
    img.width  = w*hc/h;
  } else {
    img.height = h*wc/w;
    img.width  = wc;
  }
};

// conditions is string or regexp
Helpers.getItem = function(items,condition) {
  if(!items)
    return null;
  
  for (var i = 0 ; i < items.length ; i++) {
    var item = items[i];
    if(condition.test ? condition.test(item.type) : condition==item.type) {
      return item;
    }
  }  
};

// ***** Media

var media = {};

function Media() {
  
}
Media.prototype=media;

Media.fromFile = function(file) {
  var media = new Media();
  var url = (window.URL || window.webkitURL).createObjectURL(file);
  media.url = url;
  media.type = "temporary";
  return media;
};
Media.fromUri = function(uri) {
  var media = new Media;
  media.url = uri;
  return media;
}

// *****

function MemoryControler($scope, $location) {

  // ***** Feature detection

  $scope.userMediaEnabled = (navigator.getUserMedia!=null);

  // ***** Watch location

 $scope.$location = $location;
 $scope.hash = $location.hash();

 $scope.$watch('location.path()',function() {
     $scope.hash = $location.hash();
   });
 
 // ***** List of media

 $scope.media = [];

 $scope.clear = function() {
   $scope.media = [];
 };

 $scope.removeMedia = function(m) {
   var i = $scope.media.indexOf(m);   
   if(i>=0) {
     $scope.media.splice(i, 1);
   }
 };

 $scope.addUri = function(uri) {
   $scope.media.push(Media.fromUri(uri));
 };

 $scope.addUriList = function(uriList) {
   var uris = Helpers.parseUriList(uriList);
   var n = uris.length;
   for(var i=0; i!=n; ++i) {
     $scope.addUri(uris[i]);
   }
 };

 $scope.addFile = function(file) { 
   if(file.type=="text/uri-list" || (file.type=="" && /\.uris?$/.test(file.name))) {
     var reader = new FileReader();     
     reader.readAsText(file);
     function handleText(event) {
       $scope.$apply(function() {
	   var uris = Helpers.parseUriList(event.target.result);
	   uris.forEach(function(uri) {
	       $scope.addUri(uri);
	     });
	 });
     }
     reader.onload = handleText;
   } else {
     $scope.media.push(Media.fromFile(file));
   }
 };

 $scope.addFiles = function(files) {
   var n = files.length;
   console.log("Add files: "+files.length);
   for(var i=0; i!=n; ++i) {
     $scope.addFile(files[i]);
   }
 };

 // Parse a HTML snippet:
 $scope.parseHtml = function(html) {
   // Poor man's HTMl parsing:
   var f = document.createElement("div");
   f.innerHTML = html;
   
   var imgs = f.querySelectorAll("img");		   
   var n = imgs.length;
   for(var j=0; j!=n; ++j) {
     $scope.addUri(imgs[j].src);
   }   
 };

 $scope.addDataTransfer = function(dataTransfer) {

   // ***** Debugging
   
   if(dataTransfer.files) {
     var n = dataTransfer.files.length;
     console.log("#files:"+n);
     for (var i = 0 ; i < n ; i++) {
       console.log("item #"+i+": "+dataTransfer.files[i].type);
     }
   }
   if(dataTransfer.items) {
     var n = dataTransfer.items.length;
     console.log("#items:"+n);
     for (var i = 0 ; i < n ; i++) {
       console.log("item #"+i+": "+dataTransfer.items[i].type);
     }
   }

   // ***** Process
   
   if(dataTransfer.files && dataTransfer.files.length!=0) {
     console.log("Adding files");
     $scope.addFiles(dataTransfer.files);
     return;
   }
   
   if(dataTransfer.items && dataTransfer.items.length>0) {
     
     var imageItem = Helpers.getItem(dataTransfer.items, /^image\//);
     if(imageItem && imageItem.getAsFile) {
       console.log("Adding item image/*");
       var file = imageItem.getAsFile();
       $scope.addFile(file);
       return;
     }

     var htmlItem = Helpers.getItem(dataTransfer.items, "text/html");
     if(htmlItem && htmlItem.getAsFile) {
       console.log("Adding item text/html");
       htmlItem.getAsString(function(html) {
	   $scope.$apply(function() {
	       $scope.parseHtml(html);
	     });
	 });
       return;
     }

     var uriListItem = Helpers.getItem(dataTransfer.items,"text/uri-list");
     if(uriListItem && uriListItem.getAsString) {
       console.log("Adding item text/uri-list");
       item.getAsString(function(uriList) {
	   $scope.$apply(function() {
	       $scope.addUriList(uriList);
	     });
	 });
       return;	   
     }
     
   }

   // Why only one? Is it possible to get more?
   var uri = dataTransfer.getData("text/uri-list");
   if(uri) {
     console.log("Adding uri");
     $scope.addUri(uri);
   }
 };

 // ***** Actions

 $scope.url = "";

 // TODO, change this name (too close to addUri)
 $scope.addUrl = function() {
   if($scope.url && $scope.url!="") {
     $scope.media.push(Media.fromUri($scope.url));
   }
   $scope.url = "";
 };

 // ***** Video

 $scope.stream = null;

 $scope.videoLabel = function() {
   if($scope.stream) {
     return "Stop";
   } else {
     return "Start";
   }
 };

 $scope.toggleStream = function() {
   if($scope.stream) {
     $scope.stream.stop();
     $scope.stream = null;
     console.log("video off");
     return;
   }
   var video = document.querySelector("video");

   console.log("video on");
   navigator.getUserMedia({"video": true, "audio": false},
			  function(stream) {
			    $scope.stream = stream;
			    video.src = (window.URL || window.webkitURL).createObjectURL(stream);
			  },
			  function(e) {
			    // TODO, handle error
			    alert(e);
			  }
			  );
 };
 
 $scope.takePicture = function() {
   var canvas = document.querySelector("canvas");
   var video  = document.querySelector("video");
   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
   if(canvas.toBlob) {
     function handler(blob) {
       $scope.media.push(Media.fromFile(blob));
     }
     canvas.toBlob(handler,"image/png");
   } else {
     var url = canvas.toDataURL('image/png');
     $scope.addUri(url);
   }
 };

 // ***** Launch play
  
  $scope.sizes = [4,5,6,7,8];
  
  $scope.rows = 4;
  $scope.columns = 4;

  $scope.neededTiles = function() {
    return Math.floor($scope.rows*$scope.columns/2);
  };

  $scope.playReady = function() {
    return $scope.media.length >= $scope.neededTiles();
  };

  $scope.playStyle = function() {
    if($scope.playReady) {
      return "text-success";
    } else {
      return "text-error;"
    }
  };

  $scope.playing = false;

  $scope.play = function() {
    $scope.playing = true;   
  };

  // ***** Play model
  
  $scope.grid = [];  

}

// **** All of this should by angular-ified

/* input file */
window.addEventListener("load", function() {    
    var fileInput = document.querySelector("input[type='file']");
    fileInput.addEventListener("change", function() {
	var $scope = angular.element(fileInput).scope();
	$scope.$apply(function() {
	    $scope.addFiles(fileInput.files);
	    fileInput.value = null;
	  });
      });
  });

/* Drag & Drop */
window.addEventListener("load", function() {
    var elements = document.querySelectorAll(".MemoryBuilder");
    for(var i=0; i!=elements.length; ++i) {
      var element = elements[i];
      Helpers.dropzone(element, function(dataTransfer) {
	  var $scope = angular.element(element).scope();
	  $scope.$apply(function() {
	      $scope.addDataTransfer(dataTransfer);
	    });
	});
    }
  });

/* Paste */
window.addEventListener("load", function() {
    document.querySelector(".filedrop").
      addEventListener("paste", function(e) {
	  if(!e.clipboardData)
	    return;

	  var filedrop = document.querySelector(".filedrop");
	  var $scope = angular.element(filedrop).scope();

	  $scope.$apply(function() {
	    $scope.addDataTransfer(e.clipboardData);
	    });

	});
  });

