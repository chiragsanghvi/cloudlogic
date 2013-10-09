Appacitive.Cloud.declare("code", function(req,res) {

	console.log("In cloud code");

	var start = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.addTag(req.body.tag);
	profile.set('name', req.body.name);

	
	profile.save(function () {
		profile.set('totaltime', new Date().getTime() - start);
	    res.success(profile.toJSON());
	}, function(status) {
		res.error(status);
	});
});



Appacitive.Cloud.declare("while", function(req,res) {

	console.log("In cloud while");

	while(true) {}
});


Appacitive.Cloud.declare("error", function(req,res) {
	console.log("In cloud error");
	res.statusCode = 405;
	res.headers["custom"] = "custom header";
	res.error("I am an error");
});

Appacitive.Cloud.declare("get", function(req,res) {

	console.log("In cloud get");

	var start = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.id(req.body.id).fetch(function() {
		profile.set('totaltime', new Date().getTime() - start);
	    res.success(profile.toJSON());
	}, function(status) {
		res.error(status);
	});
});

Appacitive.Cloud.declare("invalidbody", function(req,res) {
	console.log("In invalidbody");
	res.headers["content-type"] = 'text/plain';
	res.success(JSON.stringify(req.body));
});

Appacitive.Cloud.declare("invalid", function(req,res) {

	console.log("In cloud invalid");

	var startTime = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.id(req.body.id).fetch(function() {
		profile.set('totaltime', new Date().getTime() - start);
	    res.success(profile.toJSON());
	}, function(status) {
		res.error(status);
	});
});
