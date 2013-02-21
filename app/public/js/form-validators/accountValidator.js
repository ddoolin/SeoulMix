function AccountValidator() {

	this.formFields = [$("#signup_username"), $("#signup_password"), $("#signup_email")];
	this.commentFields = [$(".signup-username-comment"), $(".signup-password-comment"), $(".signup-email-comment"), $(".signup-submit-comment")];

	this.validateUsername = function(username) {
		return username.length >= 4;
	}

	this.validatePassword = function(password) {
		return password.length >= 6;
	}

	this.validateEmail = function(email) {
		var regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return regexp.test(email);
	}

	this.showErrors = function(type, comment) {
		switch (type) {
			case "username":
				this.commentFields[0].addClass("error").text(comment);
				break;
			case "password":
				this.commentFields[1].addClass("error").text(comment);
				break;
			case "email":
				this.commentFields[2].addClass("error").text(comment);
				break;
			default:
				this.commentFields[3].addClass("error").text(comment);
				break;
		}
	}
}

AccountValidator.prototype.showInvalidUsername = function() {
	this.commentFields[0].addClass("error");
	this.showErrors("username", "Username unavailable.");
}

AccountValidator.prototype.showInvalidEmail = function() {
	this.commentFields[2].addClass("error");
	this.showErrors("email", "E-mail address already in use.");
}

AccountValidator.prototype.validateForm = function() {

		var complete = true;

		for (var i = 0; i < this.commentFields.length; i++) {
			this.commentFields[i].removeClass("error");
		}

		if (this.validateUsername(this.formFields[0].val()) == false) {
			this.showErrors("username", "Should be at least 4 characters.");
			errors = false;
		}
		if (this.validatePassword(this.formFields[1].val()) == false) {
			this.showErrors("password", "Should be at least 6 characters.");
			errors = false;
		}
		if (this.validateEmail(this.formFields[2].val()) == false) {
			this.showErrors("email", "Please enter a valid e-mail address.");
			errors = false;
		}

		return complete;
}