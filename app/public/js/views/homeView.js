$(document).ready(function() {

    var hc = new HomeController();

    // Create event

    var ev = new EventValidator();

    $("#event_submit").click(function (event) {
        event.preventDefault();

        var data = {
            name: $("#event_name").val(),
            description: $("#event_description").val(),
            address: $("#event_location").val()
        };

        ev.resetCommentFields();
        if (!ev.validateForm()) {
            return false;
        }

        ev.getLocation(data.address, function (result) {
            if (result.error) {
                switch (result.error) {
                    case "Address not found":
                        ev.showErrors("location", "Address not found.");
                        break;
                    case "Not in Korea":
                        ev.showErrors("location", "Address not in Korea.");
                        break;
                    default:
                        ev.showErrors("location", "An error has occured.");
                }

                return false;
            } else {
                data.location = [result.geometry.location.lat(), result.geometry.location.lng()];
                postEvent(data);
            }
        });

        var postEvent = function (data) {
            $.ajax({
                url: "/api/events",
                type: "POST",
                data: data,
                success: function (data, textStatus, jqXHR) {
                    if (!data.error) {
                        $("#new_event_form").resetForm();
                        ev.showCreateSuccess("<b>Success!</b> Event successfully created!");
                    } else {
                        switch (data.error) {
                            case "Name cannot be blank":
                                ev.showErrors("name", "Name cannot be blank.");
                                break;
                            case "Location cannot be blank":
                                ev.showErrors("location", "Location cannot be blank.");
                                break;
                            default:
                                ev.showErrors("location", "An error has occured.");
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    ev.showErrors("location", "An unknown error has occured.");
                }
            });
        }
    });

    // Update profile

    var uv = new UpdateValidator();

    $("#update_submit").click(function (event) {
        event.preventDefault();

        var data = {
            firstname: $("#update_firstname").val(),
            lastname: $("#update_lastname").val(),
            email: $("#update_email").val(),
            pass: $("#update_pass").val()
        };

        $.ajax({
            url: "/api/users/" + $("#user_id").val(),
            type: "PUT",
            data: data,
            beforeSend: function (jqXHR, settings) {
                uv.resetFields();
                return uv.validateForm();
            },
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    uv.showUpdateAlert("alert-success", "<b>Success:</b> Account updated!");

                    $("#banner_welcome_title").text("Hello, " + data.firstname);
                } else {
                    switch (data.error) {
                        case "First name too long":
                        case "Last name too long":
                            uv.showErrors("firstname", "Personal names have a maximum limit of 50 characters.");
                            break;
                        case "E-mail in use":
                            uv.showErrors("email", "That e-mail address is already in use.");
                            break;
                        case "Invalid password":
                            uv.showErrors("password", "Must be at least 6 characters.");
                            break;
                        default:
                            uv.showUpdateAlert("alert-error", "<b>Error:</b> There was a pretty complicated error. Please try again later.");
                            break;
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                uv.showUpdateAlert("alert-error", "<b>Error:</b> There was a pretty complicated error. Please try again later.");
            }
        });
    });

    // Delete account

    var dv = new DeleteValidator();

    $("#delete_confirm").click(function (event) {
        event.preventDefault();

        $.ajax({
            url: "/api/users/" + $("#user_id").val(),
            type: "DELETE",
            data: {
                pass: $("#delete_password").val()
            },
            beforeSend: function (jqXHR, setttings) {
                return dv.validateForm();
            },
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    dv.showDeleteSuccess("<b>Success:</b> Account deleted. Redirecting to front page...");

                    setTimeout(function() {
                        window.location.href = "/";
                    }, 2500);
                } else {
                    if (data.error === "Invalid password") {
                        dv.showInvalidPassword("<b>Error:</b> Invalid password. Please try again.");
                    } else {
                        dv.showInvalidPassword("<b>Error:</b> There was a pretty complicated error. Please try again later.");
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    });

    // Update profile picture

    $("#choose_existing_photo").on("change", function () {
        var profileImage = this.files[0],
            profileImageName = profileImage.name,
            profileImageSize = profileImage.size,
            profileImageText = $("#profile_picture_comment"),
            formData = null;

        if (profileImageSize > 716800) {
            profileImageText.addClass("text-error").text("File too large!");
            return;
        } else if (profileImage.type != "image/jpeg" && profileImage.type != "image/png") {
            profileImageText.addClass("text-error").text("Not a .JPG or .PNG!");
            return;
        } else {
            profileImageText.text(profileImageName);
        }

        if (window.FileReader) {
            var reader = new FileReader();

            reader.onload = function (file) {
                $("#profile_picture").attr("src", file.target.result);
            };

            reader.readAsDataURL(profileImage);
        }

        if (window.FormData) {
            formData = new FormData();
        }

        if (formData) {
            formData.append("images[]", profileImage);
        }

        $.ajax({
            url: "/api/users/" + $("#user_id").val() + "/upload",
            type: "PUT",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    profileImageText.addClass("text-success").text("Picture updated!");
                    $("<li class='delete-photo'>").appendTo("#profile_dropdown");
                    $("<a id='delete_photo'>Delete photo</a></li>").appendTo(".delete-photo");

                    $("#delete_photo").click(function () {
                        if (window.confirm("Are you sure you want to remove your picture?")) {
                            hc.removePhoto();
                        }
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                uv.showErrors("picture", "An error has occured. Please try again later.");
            }
        });
    });
});
