
$(document).ready(function() {

	// Account creation

	var av = new AccountValidator(),
		lv = new LoginValidator(),
		ev = new EmailValidator(),
		fc = new FrontController();

	// Signup

	$("#new_user_form").ajaxForm({
		url: "/api/users",
		beforeSubmit: function(formData, jqForm, options) {
			av.resetFields();
			return av.validateForm();
		},
		success: function(responseText, status, xhr, $form) {
			if (!responseText.error) {

				av.showCreateSuccess("<b>Success!</b> You're account was created! Now logging you in...");

				setTimeout(function() {
					window.location.href = "/";
				}, 2000);
			} else {
				switch (responseText.error) {
					case "Username taken":
						av.showInvalidUsername();
						break;
					case "E-mail in use":
						av.showInvalidEmail();
						break;
					case "Invalid username":
						av.showErrors("username", "Must be between 4 and 30 characters, numbers and letters only.");
						break;
					case "Invalid password":
						av.showErrors("password", "Must be at least 6 characters.");
						break;
					case "Field cannot be empty":
						av.showErrors("default", "You must complete all fields.");
						break;
					default:
						av.showErrors("default", "An error occured. Please try again later.");
						break;
				}
			}
		},
		error: function(err) {
			av.showErrors("default", "An error occured. Please try again later.");
		}
	});

	// Login

	$("#login_submit").click(function (event) {
		event.preventDefault();

		var data = {
			user: $("#login_username").val(),
			pass: $("#login_password").val()
		};

		$.ajax({
			url: "/login",
			type: "POST",
			data: data,
			beforeSend: function (jqXHR, settings) {
				if (lv.validateForm() == false) {
					return false;
				} else {
					data.remember_me = $("#remember_me").is(":checked")
				}
			},
			success: function (data, textStatus, jqXHR) {
				if (!data.error) {
					window.location = "/home";
				} else if (data.error === "Incorrect login") {
					lv.showLoginError("Login Failure", "Please check your usename/password and try again.");
				} else {
					lv.showLoginError("Login Failure", "There was an error logging you in. Please try again later.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				lv.showLoginError("Login Failure", "There was an error logging you in. Please try again later.");
			}
		});
	});

	// Lost password
	$("#lostpass_submit").click(function (event) {
		event.preventDefault();

		var data = {
			email: $("#lostpass_email").val()
		};

		$.ajax({
			url: "/users/reset",
			type: "POST",
			data: data,
			beforeSend: function (jqXHR, settings) {
				if (ev.validateEmail($("#lostpass_email").val())) {
					ev.hideEmailAlert();
					return true;
				} else {
					ev.showEmailAlert("<b>Error:</b> Please enter a valid e-mail address!")
					return false;
				}
			},
			success: function (data, textStatus, jqXHR) {
				if (!data.error) {
					ev.showEmailSuccess("Check your e-mail on how to reset your password.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if (err.responseText == "email-not-found") {
					ev.showEmailAlert("<b>Oops!</b> There's no account associated with that e-mail. Please double check and try again.");
				} else {
					ev.showEmailAlert("Sorry, there was a problem. Please try again later!");
				}
			}
		});
	});
});