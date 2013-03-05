$(document).ready(function() {

    var hc = new HomeController();

    // Update profile

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
                uv.showErrors("email", "That e-mail address is already in use.");
            } else {
                uv.showUpdateAlert("alert-error", "<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        }
    });

    // Delete account

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
                dv.showInvalidPassword("<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        }
    });

    // Update profile picture

    $("#choose_existing_photo").on("change", function() {
        var profilePic = this.files[0],
            profilePicName = profilePic.name,
            profilePicSize = profilePic.size,
            profilePicText = $("#profile_picture_comment");

        if (profilePicSize > 716800) {
            profilePicText.addClass("text-error").text("File too large!");
            return;
        } else if (profilePic.type != "image/jpeg" && profilePic.type != "image/png") {
            profilePicText.addClass("text-error").text("Not a .JPG or .PNG!");
            return;
        } else {
            profilePicText.text(profilePicName);
        }

        if (window.FormData) {
            var formData = new FormData();
        }

        if (window.FileReader) {
            var reader = new FileReader();

            reader.onload = function(file) {
                $("#profile_picture").attr("src", file.target.result);
            }

            reader.readAsDataURL(profilePic);
        }

        if (formData) {
            formData.append("images[]", profilePic);
        }

        $.ajax({
            url: "/update-profilepic",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function() {
                profilePicText.addClass("text-success").text("Picture updated!");
            },
            error: function(err) {
                // Stuff on error
                console.log(err);
            }
        });
    });
});