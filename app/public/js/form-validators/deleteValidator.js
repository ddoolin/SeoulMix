window.SeoulMix.deleteValidator = function () {

    var that = this;

    this.formFields = [$("#delete_password"), $("#delete_password_confirm")];
    this.deleteAccount = $("#deleteacct_modal");
    this.deleteAccountAlert = $("#delete_error");

    this.deleteAccount.on("hide", function () {
        $("#deleteacct_form").resetForm();
        that.deleteAccountAlert.hide();
    });

    this.validatePasswordMatch = function (password, confirm) {
        return password == confirm;
    }

    this.showInvalidPassword = function (msg) {
        that.deleteAccountAlert.attr("class", "alert alert-error");
        that.deleteAccountAlert.html(msg);
        that.deleteAccountAlert.show();
    };

    this.showDeleteSuccess = function (msg) {
        that.deleteAccountAlert.attr("class", "alert alert-success");
        that.deleteAccountAlert.html(msg);
        that.deleteAccountAlert.show();
    };

    this.validateForm = function () {
        if (that.validatePasswordMatch(that.formFields[0].val(), that.formFields[1].val()) == false) {
            that.showInvalidPassword("<b>Error:</b> Passwords don't match! Please try again.");
            return false;
        } else {
            return true;
        }
    };
};