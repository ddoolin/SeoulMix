window.SeoulMix.accountValidator = function () {

	var that = this;

	this.userRegistration = $("#registration_modal");
	this.formFields = [$("#signup_username"), $("#signup_password"),
			$("#signup_password_confirm"), $("#signup_email")];

	this.commentFields = [$(".signup-username-comment"),
			$(".signup-password-comment"), $(".signup-password-confirm-comment"),
			$(".signup-email-comment"), $(".signup-submit-comment")];

	this.userRegistration.on("hide", function () {
		$("#new_user_form").resetForm();
		that.resetFields();
	});

	this.resetFields = function () {

		// Remove the error class (red text) and reset text to default
		for (var i = 0; i < that.commentFields.length; i++) {
			that.commentFields[i].removeClass("text-error");
		}

		that.commentFields[0].text("Cannot be changed later.");
		that.commentFields[1].text("At least 6 characters.");
		that.commentFields[2].text("");
		that.commentFields[3].text("");
		that.commentFields[4].text("");
	}

	this.validateUsername = function (username) {

		// Alphanumeric only, 4 to 30 characters
		var regexp = /^[A-Za-z0-9_]{4,30}$/;

		// Redundant length checks
		return username.length >= 4
			&& username.length <= 30
			&& regexp.test(username);
	}

	this.validatePassword = function (password) {
		return password.length >= 6;
	}

	this.validateConfirm = function (password, confirm) {
		return password === confirm;
	}

	this.validateEmail = function (email) {

		// Basic example@example.com regular expression
		var regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return regexp.test(email);
	}

	this.showErrors = function (type, msg) {
		switch (type) {
			case "username":
				that.commentFields[0].addClass("text-error").text(msg);
				break;
			case "password":
				that.commentFields[1].addClass("text-error").text(msg);
				break;
			case "confirm":
				that.commentFields[2].addClass("text-error").text(msg);
				break;
			case "email":
				that.commentFields[3].addClass("text-error").text(msg);
				break;
			default:
				that.commentFields[4].addClass("text-error")
					.text("An error occurred.Please try again.");
				break;
		};
	};

	this.showInvalidUsername = function () {
		that.commentFields[0].addClass("text-error");
		that.showErrors("username", "Username unavailable.");
	};

	this.showInvalidEmail = function () {
		that.commentFields[3].addClass("text-error");
		that.showErrors("email", "E-mail address already in use.");
	};

	this.showCreateSuccess = function (msg) {
		that.commentFields[4].addClass("text-success").html(msg);
	};

	this.validateForm = function () {
		if (that.validateUsername(that.formFields[0].val()) === false) {
			that.showErrors("username", "Must be between 4 and 30 characters.");
			return false;
		}
		if (that.validatePassword(that.formFields[1].val()) === false) {
			that.showErrors("password", "Must be at least 6 characters.");
			return false;
		}
		if (that.validateConfirm(that.formFields[1].val(), that.formFields[2].val()) === false) {
			that.showErrors("confirm", "Passwords don't match.");
			return false;
		}
		if (that.validateEmail(that.formFields[3].val()) === false) {
			that.showErrors("email", "Please enter a valid e-mail address.");
			return false;
		}

		return true;
	};
};