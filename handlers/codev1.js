Appacitive.config.apiBaseUrl = "http://apis.appacitive.com/"

var start = new Date().getTime();

var profile = request.article;
profile.addTag('testtag');
profile.set('name', profile.get('name') + "test");

profile.save(function () {
	profile.set('totaltime', new Date().getTime() - start);
    response.success();
}, function(status) {
	response.error(status);
});
