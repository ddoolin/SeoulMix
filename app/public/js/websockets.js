(function ($) {
	socket.on("eventCreated", function (event) {
		console.log(event);
	});
})(jQuery);