function ResetValidator(){
    
    this.setPassword = $("#newpass_form");
    this.setPasswordAlert = $("#newpass_error");
}

ResetValidator.prototype.validatePassword = function(password, confirm)
{
    if (password.length >= 6){
        if (password === confirm) {
            return true;
        } else {
            this.showAlert("<b>Error:</b> Passwords do not match.");
            return false;
        }
    }   else{
        this.showAlert("<b>Error:</b> Password should be at least 6 characters");
        return false;
    }
}

ResetValidator.prototype.showAlert = function(msg)
{
    this.setPasswordAlert.attr("class", "alert alert-error");
    this.setPasswordAlert.html(msg);
    this.setPasswordAlert.show();
}

ResetValidator.prototype.hideAlert = function()
{
    this.setPasswordAlert.hide();
}

ResetValidator.prototype.showSuccess = function(msg)
{
    this.setPasswordAlert.attr("class", "alert alert-success");
    this.setPasswordAlert.html(msg);
    this.setPasswordAlert.fadeIn(500);
}