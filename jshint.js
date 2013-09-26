// With Node
var JSHINT = require("jshint").JSHINT;
var fs = require("fs");

fs.readFile('./handlers/mailv1.js', "UTF-8", function(err, data) {
	var success = JSHINT(data,{
		asi: true,
		eqnull: true ,
		esnext:true,
		expr:true,
		iterator:true,
		lastsemic:true,
		laxbreak:true,
		laxcomma:true,
		loopfunc:true,
		multistr:true,
		proto:true,
		sub:true,
		supernew:true,
		latedef: true
	}, {
		this: false,
		Appacitive: false
	});
	console.log(success);
	if(!success) console.dir(JSHINT.errors);
});
