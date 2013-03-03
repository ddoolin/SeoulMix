
$(document).ready(function() {

    var hc = new HomeController();
    var uv = new UpdateValidator();

    $("#update_form").ajaxForm({
        url: "/update-profile",
        beforeSubmit: function(formData, jqForm, options) {
            uv.resetFields();
            return uv.validateForm();
        },
        success: function(responseText, status, xhr, $form) {
            if (status === "success") {
                uv.showUpdateAlert("alert-success", "<b>Success:</b> Account updated!");
            }
        },
        error: function(err) {
            if (err.responseText === "email-used") {
                uv.showInvalidEmail();
            } else {
                uv.showUpdateAlert("alert-error", "<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        }
    });

    var dv = new DeleteValidator();

    $("#deleteacct_form").ajaxForm({
        url: "/delete",
        beforeSubmit: function(formData, jqForm, options) {
            return dv.validateForm();
        },
        success: function(responseText, status, xhr, $form) {
            if (status === "success") {
                dv.showDeleteSuccess("<b>Success:</b> Account deleted. Redirecting to front page...");
                setTimeout(function() {
                    window.location.href = "/";
                }, 2500);
            }
        },
        error: function(err) {
            if (err.responseText === "invalid-password") {
                dv.showInvalidPassword("<b>Error:</b> Invalid password. Please try again.");
            } else {
                dv.showInvalidPassword("<b>Error:</b> Oops! There was a pretty complicated error. Please try again later.");
            }
        }
    });
});