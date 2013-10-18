// 1. If cacheIndex has the filename (hit); 
// 1-1. find the data from cacheData, increase the count.
// 2. If cacheIndex doesn't have the filename (miss); read the file.
// 2-1. If length of cacheIndex is less than cacheSize, insert it with count 0 - to prevent using the same index again and again.
// 2-2. If length of cacheIndex is equal to cacheSize, find the smallest count in cacheData, and replace it.

var funcs = [];
var intervalID = undefined;
var working = false;
var _basePath = '';

function work() {
	if(!intervalID) {
		intervalID = setInterval(function() {
			if(!working) {
				if(funcs.length) {
					var func = funcs.shift();
					func();
				} else {
					funcs.push(function(){
						clearInterval(intervalID);
						intervalID = undefined;
					});
				}
			}
		}, 0);
	}
}

// private: process

var fs = require('fs');
var MAX_INT = 4294967295;

var cacheData = {};
var cacheIndex = [];

var getData = function(filename) { // O(1)
	// 1-1.
	var thisData = cacheData[filename];
	if(thisData) {
		thisData.c += (thisData.c < MAX_INT) ? 1 : 0;
		// console.log("hit / filename: " + filename + " count: " + thisData.c);
		return thisData.d;
	} else {
		// console.log("miss / filename: " + filename);
		return undefined;
	}
};

var addData = function(filename, data) { // O(cacheSize)
	var findLRU = function() {
		var l = cacheIndex.length;
		if(l < cacheSize) // 2-1. 
			return l;
		else { // 2-2.
			var lIndex = -1;
			var lCount = MAX_INT;

			var findMin = function() {
				var thisCount = cacheData[cacheIndex[i]].c;
				if(thisCount < lCount) {
					lIndex = i;
					lCount = thisCount;
				}
			}

			// In case of small cacheSize & all the items of cacheData having the same count value.
			var mid = Math.floor((Math.random()*10*l)%l);
			// console.log("mid: " + mid);

			for(var i=mid; i<l; i++)
				findMin();

			for(var i=0; i<mid; i++)
				findMin();

			delete cacheData[cacheIndex[lIndex]];
			delete cacheIndex[lIndex];

			return lIndex;
		}
	};

	var i = findLRU();
	cacheData[filename] = {d: data, c: 0};
	cacheIndex[i] = filename;
};

var _readFile = function(filename, encoding, callback) {
	// handling arguments
	if (typeof(filename) != "string") {
		throw new Error("filename is not string");
	}
	if (typeof(encoding) == "function") {
		callback = encoding;
		encoding = 'UTF-8';
	}

	// 1.
	// console.log(cacheData);
	var cachedData = getData(filename);
	// console.log("(cache "+ (cachedData ? "hit " : "miss ") + filename + ")");

	if (cachedData) {
		if (callback)
			callback(undefined, cachedData);
	} else { // 2.

		work();

		funcs.push(function() {
			working = true;

            fs.exists(_basePath + filename + '.js', function (exists) {
				if (exists) {
                    fs.readFile(_basePath + filename + '.js', encoding, function(err, data) {

						addData(filename, data);

						if (callback)
							callback(err,data);
				
						working = false;
					});
				} else {
					working = false;
					callback({code:'404'});
				}
			});
		});
	}
};

var _clear = function(callback) {

	work();

	funcs.push(function() {
		cacheData = {};
		cacheIndex = [];
		
		if(callback)
			callback();
	});

};

var _removeFileFromCache = function(filename) {
	try {
		var lIndex = cacheIndex.indexOf(filename)
		if ( lIndex != -1) {
			delete cacheData[cacheIndex[lIndex]];
			delete cacheIndex[lIndex];
		}
	} catch(e){}	
};

var _removeFileFromDisk = function(filename) {
	try {
		fs.unlink( _basePath + filename + '.js', function (err) {});
	} catch(e) {}
};

var _replaceFile = function(filename, data, version) {
	//_removeFileFromCache(filename + 'v'  + (version - 1));

	var totalFileName =  filename + '-v-' + version;
	if (cacheIndex.indexOf(filename) != -1) {
		cacheData[filename] = { d : data , c : cacheData[filename].c };
	} else {
		addData(filename, data);
	}
};

var _writeFile = function(filename, data, version) {
	var totalFileName =  filename + '-v-' + version;
	try {
		fs.exists(_basePath + totalFileName, function(exists) {
			if(!exists) {
				try {
				   fs.writeFile(_basePath + totalFileName + '.js', data, {});
				} catch(e) {}
			}
		});
	} catch(e) {}
	//TODO :  find a better way to remove older file
	//_removeFileFromDisk(filename + '-v-'  + (version - 1));
};

// public

var cacheSize = 1000;

var readFile = function(filename, encoding, callback) {
	_readFile(filename, encoding, callback);
};

var replaceFile = function(filename, data, version) {
	try {
		_replaceFile(filename, data, version);
	} catch(e) {}
}

var writeFile = function(filename, data, version) {
	_writeFile(filename, data, version);
};

var changeBasePath = function(path) {
	_basePath = path;
};

var clear = function() {
	_clear();
};

module.exports.cacheSize = cacheSize;
module.exports.readFile = readFile;
module.exports.writeFile = writeFile;
module.exports.replaceFile =  replaceFile;
module.exports.changeBasePath = changeBasePath;
module.exports.clear = clear;