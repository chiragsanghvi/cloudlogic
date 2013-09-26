
var start = new Date().getTime();

var mail = function() {
	this.send = function(body) {
		var emailOptions = {
			to: [Appacitive.Users.currentUser().get('email')],
			subject: 'testing',
			body: body,
			from: 'support@appacitive.com',
			ishtml: false
		};

		Appacitive.Email.sendRawEmail(emailOptions, function () {
			request.article.addTag('Mail sent');
			request.article.addTag(Appacitive.Users.currentUser().get('email'));
			request.article.attributes('env', Appacitive.Session.environment());
			request.article.set('end', new Date().getTime() - start);
		    response.success();
		}, function(status) {
			response.error(JSON.stringify(status));
		});
	};
}


new mail().send(request.article.toString());