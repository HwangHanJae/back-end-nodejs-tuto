var dir = './data';
var fs = require('fs');

fs.readdir(dir, function(error, filelist){
    console.log(filelist)
})