console.log("I've loaded");

var mail = function() {
	this.send = function(body, emailId, response) {

		var emailOptions = {
			to: [emailId],
			subject: 'testing',
			body: body,
			from: 'support@appacitive.com',
			ishtml: false
		};

		Appacitive.Email.sendRawEmail(emailOptions, function () {
		    response.success("Mail Sent");
		}, function(status) {
			response.error(JSON.stringify(status));
		});
	};
}

module.exports = new mail();