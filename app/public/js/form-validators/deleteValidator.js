function DeleteValidator() {

    var that = this;

    that.formFields = [$("#delete_password"), $("#delete_password_confirm")];
    that.deleteAccount = $("#deleteacct_modal");
    that.deleteAccountAlert = $("#delete_error");

    that.deleteAccount.on("hide", function() {
        $("#deleteacct_form").resetForm();
        that.deleteAccountAlert.hide();
    });

    that.validatePasswordMatch = function(password, confirm) {
        return password == confirm;
    }
}

DeleteValidator.prototype.showInvalidPassword = function(msg) {
    this.deleteAccountAlert.attr("class", "alert alert-error");
    this.deleteAccountAlert.html(msg);
    this.deleteAccountAlert.show();
}

DeleteValidator.prototype.showDeleteSuccess = function(msg) {
    this.deleteAccountAlert.attr("class", "alert alert-success");
    this.deleteAccountAlert.html(msg);
    this.deleteAccountAlert.show();
}

DeleteValidator.prototype.validateForm = function() {

    if (this.validatePasswordMatch(this.formFields[0].val(), this.formFields[1].val()) == false) {
        this.showInvalidPassword("<b>Error:</b> Passwords don't match! Please try again.");
        return false;
    } else {
        return true;
    }
}