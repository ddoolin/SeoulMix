function EmailValidator() {

  var that = this;

    that.retrievePassword = $("#lostpass_modal");
    that.retrievePasswordAlert = $("#lostpass_error");

    that.retrievePassword.on("hide", function() {
        $("#lostpass_form").resetForm();
        that.retrievePasswordAlert.hide();
    });
}

EmailValidator.prototype.validateEmail = function(email) {
  var regexp  = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  return regexp.test(email);
}

EmailValidator.prototype.showEmailAlert = function(msg) {
  this.retrievePasswordAlert.attr('class', 'alert alert-error');
  this.retrievePasswordAlert.html(msg);
  this.retrievePasswordAlert.show();
}

EmailValidator.prototype.hideEmailAlert = function() {
  this.retrievePasswordAlert.hide();
}

EmailValidator.prototype.showEmailSuccess = function(msg) {
  this.retrievePasswordAlert.attr('class', 'alert alert-success');
  this.retrievePasswordAlert.html(msg);
  this.retrievePasswordAlert.fadeIn(500);
}