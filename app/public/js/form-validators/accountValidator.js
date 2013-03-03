function AccountValidator() {

	var that = this;

	that.userRegistration = $("#registration_modal");
	that.formFields = [$("#signup_username"), $("#signup_password"),
		$("#signup_password_confirm"), $("#signup_email")];

	that.commentFields = [$(".signup-username-comment"),
		$(".signup-password-comment"), $(".signup-password-confirm-comment"),
		$(".signup-email-comment"), $(".signup-submit-comment")];

	that.userRegistration.on("hide", function() {
		$("#new_user_form").resetForm();
		that.resetFields();
	});

	that.resetFields = function() {

		// Remove the error class (red text) and reset text to default
		for (var i = 0; i < that.commentFields.length; i++) {
			that.commentFields[i].removeClass("error");
		}

		that.commentFields[0].text("Cannot be changed later.");
		that.commentFields[1].text("At least 6 characters.");
		that.commentFields[2].text("");
		that.commentFields[3].text("");
		that.commentFields[4]
			.text("By clicking, you agree to our terms and conditions.");
	}

	that.validateUsername = function(username) {

		// Alphanumeric only, 4 to 30 characters
		var regexp = /^[A-Za-z0-9_]{4,30}$/;

		// Redundant length checks
		return username.length >= 4
			&& username.length <= 30
			&& regexp.test(username);
	}

	that.validatePassword = function(password) {
		return password.length >= 6;
	}

	that.validateConfirm = function(password, confirm) {
		return password === confirm;
	}

	that.validateEmail = function(email) {

		// Basic example@example.com regular expression
		var regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return regexp.test(email);
	}

	that.showErrors = function(type, msg) {
		switch (type) {
			case "username":
				that.commentFields[0].addClass("error").text(msg);
				break;
			case "password":
				that.commentFields[1].addClass("error").text(msg);
				break;
			case "confirm":
				that.commentFields[2].addClass("error").text(msg);
				break;
			case "email":
				that.commentFields[3].addClass("error").text(msg);
				break;
			default:
				that.commentFields[4].addClass("error")
					.text("An error occurred.Please try again.");
				break;
		}
	}
}

AccountValidator.prototype.showInvalidUsername = function() {
	this.commentFields[0].addClass("error");
	this.showErrors("username", "Username unavailable.");
}

AccountValidator.prototype.showInvalidEmail = function() {
	this.commentFields[3].addClass("error");
	this.showErrors("email", "E-mail address already in use.");
}

AccountValidator.prototype.validateForm = function() {

		if (this.validateUsername(this.formFields[0].val()) === false) {
			this.showErrors("username", "Must be between 4 and 30 characters.");
			return false;
		}
		if (this.validatePassword(this.formFields[1].val()) === false) {
			this.showErrors("password", "Must be at least 6 characters.");
			return false;
		}
		if (this.validateConfirm(this.formFields[1].val(), this.formFields[2].val()) === false) {
			this.showErrors("confirm", "Passwords don't match.");
			return false;
		}
		if (this.validateEmail(this.formFields[3].val()) === false) {
			this.showErrors("email", "Please enter a valid e-mail address.");
			return false;
		}

		return true;
}