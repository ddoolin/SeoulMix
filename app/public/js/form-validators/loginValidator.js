window.SeoulMix.loginValidator = function () {

	var that = this;
	
	this.loginErrors = $("#loginerr_modal");

	this.loginErrors.modal({
		show: false,
		keyboard: true,
		backdrop: true
	});

	this.showLoginError = function (title, msg) {
		$("#loginerr_modal .modal-header h3").text(title);
		$("#loginerr_modal .modal-body p").text(msg);
		that.loginErrors.modal("show");
	}

	this.validateForm = function () {
		if ($("#login_username").val() == "") {
			that.showLoginError("Whoops!", "Please enter a valid username!");
			return false;
		} else if ($("#login_password").val() == "") {
			that.showLoginError("Whoops!", "Please enter a valid password!");
			return false;
		} else {
			return true;
		}
	};
};