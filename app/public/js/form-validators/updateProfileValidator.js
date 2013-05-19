window.SeoulMix.updateProfileValidator = function () {

    var that = this;

    this.updateProfile = $("#profile_modal");
    this.updateProfileAlert = $("#update_done");
    this.formFields = [$("#update_firstname"), $("#update_lastname"),
        $("#update_email"), $("#update_password"),
        $("#update_password_confirm"), $("#profile_picture")];

    this.commentFields = [$(".update-firstname-comment"),
        $(".update-lastname-comment"), $(".update-email-comment"),
        $(".update-password-comment"), $(".update-password-confirm-comment"),
        $(".profile-picture-comment")];

    // Clear form on hide, not show! 
    this.updateProfile.on("hide", function () {

        // Reset the form, clear the text, and remove the success if it exists
        $("#update_form").resetForm();
        that.resetFields();
    });

    this.resetFields = function () {

        for (var i = 0; i < that.commentFields.length; i++) {
            that.commentFields[i].removeClass("text-error").text("");
        }

        that.updateProfileAlert
        .removeClass("alert-success alert-error text-error").text("").hide();
    }

    // 50 characters should be enough for each
    this.validateFirstname = function (firstname) {
        return firstname.length <= 50;
    }

    this.validateLastname = function (lastname) {
        return lastname.length <= 50;
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

    this.validatePictureSize = function (file) {
        return file.size > 0 && file.size <= 716800;
    }

    this.validatePictureType = function (file) {
        if (file.type == "image/jpeg" || file.type == "image/png") {
            return true;
        } else {
            return false;
        }
    }

    this.showErrors = function (type, msg) {
        switch (type) {
            case "firstname":
                that.commentFields[0].addClass("text-error").text(msg);
                break;
            case "lastname":
                that.commentFields[1].addClass("text-error").text(msg);
                break;
            case "email":
                that.commentFields[2].addClass("text-error").text(msg);
                break;
            case "password":
                that.commentFields[3].addClass("text-error").text(msg);
                break;
            case "confirm":
                that.commentFields[4].addClass("text-error").text(msg);
                break;
            case "picture":
                that.commentFields[5].addClass("text-error").text(msg);
            default:
                that.updateProfileAlert.addClass("alert-error")
                    .html("<b>Error:</b> An unknown error occured. Please try again later.");
                break;
        }
    }

    this.showUpdateAlert = function (classname, msg) {
        that.updateProfileAlert.addClass(classname).html(msg);
        that.updateProfileAlert.show();
    };

    this.validateForm = function () {
        if (that.validateFirstname(that.formFields[0].val()) === false) {
            that.showErrors("firstname", "Must be less than 50 characters.");
            return false;
        }
        if (that.validateLastname(that.formFields[1].val()) === false) {
            that.showErrors("lastname", "Must be less than 50 characters.");
            return false;
        }
        if (that.validateEmail(that.formFields[2].val()) === false) {
            that.showErrors("email", "Please enter a valid e-mail address.");
            return false;
        }
        if (that.formFields[3].val() != "") {
            if (that.validatePassword(that.formFields[3].val()) === false) {
                that.showErrors("password", "Must be at least 6 characters.");
                return false;
            }
        }
        if (that.validateConfirm(that.formFields[3].val(),
                                    that.formFields[4].val()) === false) {
            that.showErrors("confirm", "Passwords must match.");
            return false;
        }
        if (that.formFields[5].val() != "") {
            if (that.validatePictureSize(that.formFields[5].val()) === false) {
                that.showErrors("picture", "File too large.");
                return false;        
            }
            if (that.validatePictureType(that.formFields[5].val()) === false) {
                that.showErrors("picture", "File is not a .JPG or .PNG.");
                return false;
            }
        }

        return true;
    };
};