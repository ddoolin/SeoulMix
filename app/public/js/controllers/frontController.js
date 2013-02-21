function FrontController() {
	
	// Autofocusing fields
	$("#login_username").focus();

	$("#registration_modal").on("shown", function() {
		$("#login_username").blur();
		$("#signup_username").focus();	
	});

	$("#registration_modal").on("hidden", function() {
		$("#signup_username").blur();
		$("#login_username").focus();
	});

	$("#lostpass_modal").on("shown", function() {
		$("#signup_username").blur();
		$("#lostpass_email").focus();
	});

	$("#lostpass_modal").on("hidden", function() {
		$("#lostpass_email").blur();
		$("#login_username").focus();
	});
}