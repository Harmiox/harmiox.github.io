//Global Functions
function readGivenFile(theFile) {
    fs = require('fs');
    let data = fs.readFileSync(theFile).toString();
    return data;
}
function writeGivenFile(theFile, fileData) {
    var fs = require('fs');
    fs.writeFileSync(theFile, fileData);
}

//Cog Loader
var loadedCogs = {};
function loadCogs() {
    loadedCogs = {};
    let importedCogs = JSON.parse(readGivenFile("./cogs.json"));
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
      if (file.match(/\.js$/) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        exports[name] = require('./' + file);
      }
    });
    var count = 0;
    for (var obj in importedCogs.cogs) {
        if(importedCogs.cogs.hasOwnProperty(obj) ) {
            let cog = obj.replace('.js', '')
            if (!exports[cog]) {
                console.log(cog + ".js | imported = false");
                return;
            } else {
                loadedCogs[cog] = new exports[cog]();
                console.log(cog + ".js | imported = true");
                count += 1;
            }
        } 
    }
}
loadCogs()

//index.js
var cogs = function() {
    var self = this;
    self.unloaded = exports;
    self.loaded = loadedCogs;
    self.reload = function() {
        loadCogs();
    }
    self.readFile = function(file) {
        return readGivenFile(file);
    }
    self.writeFile = function(file,data) {
        writeGivenFile(file,data);
    }
};
module.exports = cogs;
