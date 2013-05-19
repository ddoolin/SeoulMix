window.SeoulMix.resetValidator = function (){

    var that = this;
    
    this.setPassword = $("#newpass_form");
    this.setPasswordAlert = $("#newpass_error");

    this.validatePassword = function (password, confirm) {
        if (password.length >= 6){
            if (password === confirm) {
                return true;
            } else {
                that.showAlert("<b>Error:</b> Passwords do not match.");
                return false;
            }
        }   else{
            that.showAlert("<b>Error:</b> Password should be at least 6 characters");
            return false;
        }
    };

    this.showAlert = function (msg) {
        that.setPasswordAlert.removeClass("alert-success")
            .addClass("alert-error");
        that.setPasswordAlert.html(msg);
        that.setPasswordAlert.show();
    };

    this.hideAlert = function () {
        that.setPasswordAlert.hide();
    };

    this.showSuccess = function (msg) {
        that.setPasswordAlert.removeClass("alert-error")
            .addClass("alert-success");
        that.setPasswordAlert.html(msg);
        that.setPasswordAlert.fadeIn(500);
    };
};