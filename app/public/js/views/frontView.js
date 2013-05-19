$(document).ready(function () {

	var seoulmix = window.SeoulMix,
		fc = new seoulmix.frontController(),
		av = new seoulmix.accountValidator(),
		lv = new seoulmix.loginValidator(),
		ev = new seoulmix.emailValidator();

	// Signup
	$("#signup_submit").click(function (event) {
		event.preventDefault();

		fc.createAccount(av);
	});

	// Login
	$("#login_submit").click(function (event) {
		event.preventDefault();

		fc.attemptLogin(lv);
	});

	// Lost password
	$("#lostpass_submit").click(function (event) {
		event.preventDefault();

		fc.lostPass(ev);
	});

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
});