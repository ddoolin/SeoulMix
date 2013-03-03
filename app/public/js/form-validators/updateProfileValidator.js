function UpdateValidator() {

    var that = this;

    that.updateProfile = $("#profile_modal");
    that.updateProfileAlert = $("#update_done");
    that.formFields = [$("#update_firstname"), $("#update_lastname"),
        $("#update_email"), $("#update_password"),
        $("#update_password_confirm")];

    that.commentFields = [$(".update-firstname-comment"),
        $(".update-lastname-comment"), $(".update-email-comment"),
        $(".update-password-comment"), $(".update-password-confirm-comment")];

    // Clear form on hide, not show! 
    that.updateProfile.on("hide", function() {

        // Reset the form, clear the text, and remove the success if it exists
        $("#update_form").resetForm();
        that.resetFields();
    });

    that.resetFields = function() {

        for (var i = 0; i < that.commentFields.length; i++) {
            that.commentFields[i].removeClass("error").text("");
        }

        that.updateProfileAlert.removeClass("alert-success alert-error").text("").hide();
    }

    // 50 characters should be enough for each
    that.validateFirstname = function(firstname) {
        return firstname.length <= 50;
    }

    that.validateLastname = function(lastname) {
        return lastname.length <= 50;
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
            case "firstname":
                that.commentFields[0].addClass("error").text(msg);
                break;
            case "lastname":
                that.commentFields[1].addClass("error").text(msg);
                break;
            case "email":
                that.commentFields[2].addClass("error").text(msg);
                break;
            case "password":
                that.commentFields[3].addClass("error").text(msg);
                break;
            case "confirm":
                that.commentFields[4].addClass("error").text(msg);
                break;
            default:
                that.updateProfile.addClass("alert-error")
                    .text("An unknown error occured. Please try again later.");
                break;
        }
    }
}

UpdateValidator.prototype.showInvalidEmail = function() {
    this.commentFields[2].addClass("error");
    this.showErrors("email", "That e-mail address is already in use.");
}

UpdateValidator.prototype.showUpdateAlert = function(classname, msg) {
    this.updateProfileAlert.addClass(classname).html(msg);
    this.updateProfileAlert.show();
}

UpdateValidator.prototype.validateForm = function() {

    if (this.validateFirstname(this.formFields[0].val()) === false) {
        this.showErrors("firstname", "Must be less than 50 characters.");
        return false;
    }
    if (this.validateLastname(this.formFields[1].val()) === false) {
        this.showErrors("lastname", "Must be less than 50 characters.");
        return false;
    }
    if (this.validateEmail(this.formFields[2].val()) === false) {
        this.showErrors("email", "Please enter a valid e-mail address.");
        return false;
    }
    if (this.formFields[3].val() != "") {
        if (this.validatePassword(this.formFields[3].val()) === false) {
            this.showErrors("password", "Must be at least 6 characters.");
            return false;
        }
    }
    if (this.validateConfirm(this.formFields[3].val(), this.formFields[4].val()) === false) {
        this.showErrors("confirm", "Passwords must match.");
        return false;
    }

    return true;
}