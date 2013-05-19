window.SeoulMix.emailValidator = function () {

    var that = this;

    this.retrievePassword = $("#lostpass_modal"),
    this.retrievePasswordAlert = $("#lostpass_error");

    this.retrievePassword.on("hide", function () {
        $("#lostpass_form").resetForm();
        that.retrievePasswordAlert.hide();
    });

    this.validateEmail = function (email) {
        var regexp  = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return regexp.test(email);
    };

    this.showEmailAlert = function (msg) {
        that.retrievePasswordAlert.removeClasS("alert-success")
            .addClass("alert-error");
        that.retrievePasswordAlert.html(msg);
        that.retrievePasswordAlert.show();
    };

    this.hideEmailAlert = function () {
        that.retrievePasswordAlert.hide();
    };

    this.showEmailSuccess = function (msg) {
        that.retrievePasswordAlert.removeClass("alert-error")
            .addClass("alert-success");
        that.retrievePasswordAlert.html(msg);
        that.retrievePasswordAlert.fadeIn(500);
    };
};