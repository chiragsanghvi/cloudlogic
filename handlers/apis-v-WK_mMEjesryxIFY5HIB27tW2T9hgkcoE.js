Appacitive.Cloud.declare("code", function(req,res) {

	console.log("In cloud code");

	var start = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.addTag(request.body.tag);
	profile.set('name', request.body.name);

	
	profile.save(function () {
		profile.set('totaltime', new Date().getTime() - start);
	    response.success(profile.toJSON());
	}, function(status) {
		response.error(status);
	});
});



Appacitive.Cloud.declare("while", function(req,res) {

	console.log("In cloud while");

	while(true) {}
});


Appacitive.Cloud.declare("error", function(req,res) {
	console.log("In cloud error");
	response.statusCode = 405;
	response.headers["custom"] = "custom header";
	response.error("I am an error");
});

Appacitive.Cloud.declare("get", function(req,res) {

	console.log("In cloud get");

	var start = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.id(req.body.id).fetch(function() {
		profile.set('totaltime', new Date().getTime() - start);
	    response.success(profile.toJSON());
	}, function(status) {
		response.error(status);
	});
});





Appacitive.Cloud.declare("invalid", function(req,res) {

	console.log("In cloud invalid");

	var startTime = new Date().getTime();

	var profile = new Appacitive.Article('profile');
	profile.id(req.body.id).fetch(function() {
		profile.set('totaltime', new Date().getTime() - start);
	    response.success(profile.toJSON());
	}, function(status) {
		response.error(status);
	});
});
