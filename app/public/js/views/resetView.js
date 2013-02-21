
$(document).ready(function() {

    $("#new_password").focus();

   var rv = new ResetValidator();

   $("#newpass_form").ajaxForm({
        beforeSubmit: function(formData, jqForm, options) {
            rv.hideAlert();
            if (rv.validatePassword($("#new_password").val()) == false) {
                return false;
            } else {
                return true;
            }
        },
        success: function(responseText, status, xhr, $form) {
            rv.showSuccess("Your password has been reset. Redirecting to the home page now...");
            setTimeout(function() {
                window.location.href = "/";
            }, 3000);
        },
        error: function(err) {
            rv.showAlert("Sorry, something went wrong. Please try again.");
        }
   });
});