$(document).ready(function() {

    var hc = new HomeController();

    // Create event

    var ev = new EventValidator();

    $("#new_event_form").ajaxForm({
        url: "/api/events",
        beforeSubmit: function(formData, jqForm, options) {
            return ev.validateForm();
        },
        success: function (responseText, status, xhr, $form) {
            if (status === "success") {
                console.log("Event created!");
            }
        },
        error: function (err) {
            console.log(err.responseText);
        }
    })

    // Update profile

    var uv = new UpdateValidator();

    $("#update_form").ajaxForm({
        url: "/update-profile",
        beforeSubmit: function (formData, jqForm, options) {
            uv.resetFields();
            return uv.validateForm();
        },
        success: function (responseText, status, xhr, $form) {
            if (status === "success") {
                uv.showUpdateAlert("alert-success", "<b>Success:</b> Account updated!");

                $("#banner_welcome_title").text("Hello, " + responseText.firstname);
            }
        },
        error: function (err) {
            if (err.responseText === "email-used") {
                uv.showErrors("email", "That e-mail address is already in use.");
            } else if (err.responseText === "invalid-password") {
                uv.showErrors("password", "Must be at least 6 characters.");
            } else if (err.responseText === "invalid-name") {
                uv.showErrors("firstname", "Personal names have a maximum limit of 50 characters.");
            } else {
                uv.showUpdateAlert("alert-error", "<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        }
    });

    // Delete account

    var dv = new DeleteValidator();

    $("#deleteacct_form").ajaxForm({
        url: "/delete",
        beforeSubmit: function (formData, jqForm, options) {
            return dv.validateForm();
        },
        success: function (responseText, status, xhr, $form) {
            if (status === "success") {
                dv.showDeleteSuccess("<b>Success:</b> Account deleted. Redirecting to front page...");
                setTimeout(function() {
                    window.location.href = "/";
                }, 2500);
            }
        },
        error: function (err) {
            if (err.responseText === "invalid-password") {
                dv.showInvalidPassword("<b>Error:</b> Invalid password. Please try again.");
            } else {
                dv.showInvalidPassword("<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        }
    });

    // Update profile picture

    $("#choose_existing_photo").on("change", function () {
        var profilePic = this.files[0],
            profilePicName = profilePic.name,
            profilePicSize = profilePic.size,
            profilePicText = $("#profile_picture_comment"),
            formData = null;

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
            formData = new FormData();
        }

        if (window.FileReader) {
            var reader = new FileReader();

            reader.onload = function (file) {
                $("#profile_picture").attr("src", file.target.result);
            };

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
            success: function () {
                profilePicText.addClass("text-success").text("Picture updated!");
                $("<li class='delete-photo'>").appendTo("#profile_dropdown");
                $("<a id='delete_photo'>Delete photo</a></li>").appendTo(".delete-photo");

                $("#delete_photo").click(function () {
                    if (window.confirm("Are you sure you want to remove your picture?")) {
                        hc.removePhoto();
                    }
                });
            },
            error: function (err) {
                // Stuff on error
                console.log(err);
            }
        });
    });
});
