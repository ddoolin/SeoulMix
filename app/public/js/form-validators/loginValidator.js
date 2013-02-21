function LoginValidator() {
	
	this.loginErrors = $("#loginerr_modal");
	this.loginErrors.modal({
		show: false,
		keyboard: true,
		backdrop: true
	});

	this.showLoginError = function(title, msg) {
		console.log(title, msg);
		$("#loginerr_modal .modal-header h3").text(title);
		$("#loginerr_modal .modal-body p").text(msg);
		this.loginErrors.modal("show");
	}
}

LoginValidator.prototype.validateForm = function() {
	if ($("#login_username").val() == "") {
		this.showLoginError("Whoops!", "Please enter a valid username!");
		return false;
	} else if ($("#login_password").val() == "") {
		this.showLoginError("Whoops!", "Please enter a valid password!");
		return false;
	} else {
		return true;
	}
}