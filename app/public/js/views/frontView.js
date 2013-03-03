
$(document).ready(function() {

	// Account creation

	var av = new AccountValidator(),
		lv = new LoginValidator(),
		ev = new EmailValidator(),
		fc = new FrontController();

	// Signup

	$("#new_user_form").ajaxForm({
		url: "/signup",
		beforeSubmit: function(formData, jqForm, options) {
			av.resetFields();
			return av.validateForm();
		},
		success: function(responseText, status, xhr, $form) {
			if (status == "success") {
				window.alert("Your account has been created! Hooray! Now login and get started! :)");
				$("#registration_modal").modal("hide");
			}
		},
		error: function(err) {
			if (err.responseText == "username-taken") {
				av.showInvalidUsername();
			} else if (err.responseText == "email-used") {
				av.showInvalidEmail();
			}
		}
	});

	// Login 

	$("#login_form").ajaxForm({
		url: "/",
		beforeSubmit: function(formData, jqForm, options) {
			if (lv.validateForm() == false) {
				return false;
			} else {
				formData.push({
					name: "remember-me",
					value: $("#remember_me").is(":checked")
				});
			}
		},
		success: function(responseText, status, xhr, $form) {
			if (status == "success") {
				window.location.href = "/home";
			}
		},
		error: function(err) {
			lv.showLoginError("Login Failure", "Please check your usename/password and try again.");
		}
	});

	// Lost password

	$("#lostpass_form").ajaxForm({
		url: "/lost-password",
		beforeSubmit: function(formData, jqForm, options) {
			if (ev.validateEmail($("#lostpass_email").val())) {
				ev.hideEmailAlert();
				return true;
			} else {
				ev.showEmailAlert("<b>Error:</b> Please enter a valid e-mail address!")
				return false;
			}
		},
		success: function(responseText, status, xhr, $form) {
			if (status == "success") {
				ev.showEmailSuccess("Check your e-mail on how to reset your password.");
			}
		},
		error: function(err) {
			if (err.responseText == "email-not-found") {
				ev.showEmailAlert("<b>Oops!</b> There's no account associated with that e-mail. Please double check and try again.");
			} else {
				ev.showEmailAlert("Sorry, there was a problem. Please try again later!");
			}
		}
	})
});