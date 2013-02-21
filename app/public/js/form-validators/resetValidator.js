function ResetValidator(){
    
    this.setPassword = $('#newpass_form');
    this.setPasswordAlert = $('#newpass_error');
}

ResetValidator.prototype.validatePassword = function(pass)
{
    if (pass.length >= 6){
        return true;
    }   else{
        this.showAlert('Password Should Be At Least 6 Characters');
        return false;
    }
}

ResetValidator.prototype.showAlert = function(msg)
{
    this.setPasswordAlert.attr('class', 'alert alert-error');
    this.setPasswordAlert.html(msg);
    this.setPasswordAlert.show();
}

ResetValidator.prototype.hideAlert = function()
{
    this.setPasswordAlert.hide();
}

ResetValidator.prototype.showSuccess = function(msg)
{
    this.setPasswordAlert.attr('class', 'alert alert-success');
    this.setPasswordAlert.html(msg);
    this.setPasswordAlert.fadeIn(500);
}