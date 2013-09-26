console.log("I've loaded");

var mail = function() {
	this.send = function(body) {

		console.log(Appacitive);
		var emailOptions = {
			to: [Appacitive.Users.currentUser().get('email')],
			subject: 'testing',
			body: body,
			from: 'support@appacitive.com',
			ishtml: false
		};

		Appacitive.Email.sendRawEmail(emailOptions, function () {
		    response.success();
		}, function(status) {
			response.error(JSON.stringify(status));
		});
	};
}

module.exports = new mail();