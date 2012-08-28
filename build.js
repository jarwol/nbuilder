var fs = require("fs"),
	exec = require("child_process").exec,
	config = require("nconf");

const DEFAULT_CONFIG = "build.json";

var Builder = function (fileName) {
	if(!fileName) {
		fileName = DEFAULT_CONFIG;
	}
	config.file("build", fileName);
};

Builder.prototype.buildAll = function () {
	for (var store in this.config.stores['build'].store) {
		if (this.config.stores['build'].store.hasOwnProperty(store)) {
			this.build(store);
		}
	}
}

Builder.prototype.build = function (name) {
	var store = this.config.get(name);
	fs.readdir(store['sourceDir'], function (err, files) {
		if (err) {
			console.log(err);
		}
		else {
			var fileExp = new RegExp("^(.+)\." + store['inputExtension'] + '$');
			var ignores = [];
			for(var ignoreExp in store['ignore']){
				ignores.push(new RegExp("^" + ignoreExp + "$"));
			}
			for (var i = 0; i < files.length; i++) {
				var match = fileExp.exec(files[i]);
				if (match != null && !isIgnored(ignores, files[i])) {
					var inFile = match[0], outFile = match[1] + '.' + store['outputExtension'];
					var cmd = store['command'].replace("$inFile", store['outputDir'] + '/' + inFile);
					cmd = cmd.replace("$outFile", store['outputDir'] + '/' + outFile);
					exec(cmd);
				}
			}
		}
	});
}

function isIgnored(arrIgnore, fileName){
	for(var exp in arrIgnore){
		if(exp.exec(fileName)){
			return true;
		}
	}
	return false;
}

exports.Builder = Builder;