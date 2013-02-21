
$(document).ready(function() {

	// Account creation

	var av = new AccountValidator();
	var fc = new FrontController();

	$("#new_user_form").ajaxForm({
		url: "/signup",
		beforeSubmit: function(formData, jqForm, options) {
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

	var lv = new LoginValidator();

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

	var ev = new EmailValidator();

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
			ev.showEmailSuccess("Check your e-mail on how to reset your password.");
		},
		error: function(err) {
			ev.showEmailAlert("Sorry, there was a problem. Please try again later!");
		}
	})
});