
$(document).ready(function() {

    $("#new_password").focus();

    var rv = new ResetValidator();

    $("#newpass_submit").click(function (event) {
        event.preventDefault();

        var data = {
            pass: $("#new_password").val(),
            reset: true
        };

        $.ajax({
            url: "/api/users/" + $("#user_id").val(),
            type: "PUT",
            data: data,
            beforeSend: function (jqXHR, settings) {
                rv.hideAlert();
                if (rv.validatePassword($("#new_password").val(), $("#new_password_confirm").val()) == false) {
                    return false;
                } else {
                    return true;
                }
            },
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    rv.showSuccess("Your password has been reset. Redirecting to the home page now...");
                    setTimeout(function() {
                        window.location.href = "/";
                    }, 3000);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                rv.showAlert("Sorry, something went wrong. Please try again.");
            }
        });
    });
});