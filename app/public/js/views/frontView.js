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

	$("#registration_modal").on("shown", function () {
		$("#signup_username").focus();	
	}).on("hidden", function () {
		$("#login_username").focus();
	});

	$("#lostpass_modal").on("shown", function () {
		$("#lostpass_email").focus();
	}).on("hidden", function () {
		$("#login_username").focus();
	});

	$("#loginerr_modal").on("shown", function () {
		$("#loginerr_modal .btn-info").focus();
	}).on("hidden", function () {
		$("#login_password").focus();
	});
});