window.SeoulMix.homeController = function () {

    var that = this,
        mainController = new window.SeoulMix.mainController();

    this.findOnMap = function () {
        var geocoder = new google.maps.Geocoder(),
            modal = $("#create_event_modal"),
            banner = $("#banner_main"),
            location_finder = $("#location_finder_popup"),
            marker;

        modal.modal("hide");
        banner.fadeOut();
        location_finder.fadeIn(600);

        location_finder.draggable({
            containment: "parent"
        }).draggable("enable");

        setTimeout(function () {
            marker = mainController.createColoredMarker("blue");

            google.maps.event.addListener(marker, "dragend", function () {
                geocoder.geocode({
                    "latLng": marker.getPosition(),
                    "region": "KR"
                }, function (results, status) {
                    $("#address").val(results[0].formatted_address);
                });
            });
        }, 500);

        $("#find_address").click(function (event) {
            errorBadge = $("#location_finder_popup .badge");
            address = $("#address").val();

            // Badge collapses if no text value
            errorBadge.text("").tooltip("destroy");

            if (address.length < 3) {
                errorBadge.text("!");
                errorBadge.tooltip({
                    title: "Address too short",
                    placement: "left"
                });
                return false;
            }

            geocoder.geocode({
                "address": address,
                "region": "KR"
            }, function (results, status) {
                if (status !== "OK" && status !== "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Unknown error",
                        placement: "left"
                    });
                    return false;
                } else if (status === "ZERO_RESULTS") {
                    errorBadge.text("!");
                    errorBadge.tooltip({
                        title: "Address not found",
                        placement: "left"
                    });
                    return false;
                }

                marker.setPosition(results[0].geometry.location);
            });
        });

        $("#accept_address").click(function (event) {
            $("#event_location").val($("#address").val());
            marker.setMap(null);
            modal.modal("show");
            location_finder.fadeOut();
            banner.fadeIn();
        });

        $("#cancel_finder").click(function (event) {
            event.preventDefault();
            $("#address").val("");

            marker.setMap(null);
            modal.modal("show");
            location_finder.fadeOut();
            location_finder.draggable("disable");
            banner.fadeIn();
        });
    };

    this.createEvent = function (ev) {
        var marker,
            data = {
                name: $("#event_name").val(),
                description: $("#event_description").val(),
                address: $("#event_location").val(),
                startTime: new Date($("#from_date").val() + " " + $("#from_time").val()),
                endTime: new Date($("#to_date").val() + " " + $("#to_time").val())
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

                $.ajax({
                    url: "/api/events",
                    type: "POST",
                    data: data,
                    success: function (data, textStatus, jqXHR) {
                        if (!data.error) {
                            ev.resetFields();
                            ev.showCreateSuccess("<b>Success!</b> Event successfully created!");

                            marker = mainController.createColoredMarker("green", [data.location.lat, data.location.lng]);
                            mainController.createInfoWindow(false, marker, data);
                            window.SeoulMix.map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));

                            setTimeout(function () {
                                $("#create_event_modal").modal("hide");
                                $(".event-alert").hide();
                            }, 1000);
                        } else {
                            switch (data.error) {
                                case "Name cannot be blank":
                                    ev.showErrors("name", "Name cannot be blank.");
                                    break;
                                case "Location cannot be blank":
                                    ev.showErrors("location", "Location cannot be blank.");
                                    break;
                                case "Times cannot be blank":
                                    ev.showErrors("time", "Times cannot be blank.");
                                    break;
                                case "Times cannot be in the past":
                                    ev.showErrors("time", "Times cannot be in the past.");
                                    break;
                                case "End time must come after start time":
                                    ev.showErrors("time", "End time must come after start time.");
                                    break;
                                case "Invalid time":
                                    ev.showErrors("time", "Invalid time.");
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
    };

    this.updatePhoto = function (uv, event) {
        var profileImage = event.target.files[0],
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
                            that.removePhoto();
                        }
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                uv.showErrors("picture", "An error has occured. Please try again later.");
            }
        });
    };

    // Remove profile photo
    this.removePhoto = function () {
        $.ajax({
            url: "/api/users/" + $("#user_id").val() + "/upload",
            type: "DELETE",
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    newImageURL = $.cloudinary.url(data.profileImage.id + "." + data.profileImage.format);
                    $("#profile_picture").attr("src", newImageURL);

                    $("#profile_picture_comment").addClass("text-success")
                        .text("Photo successfully removed.");
                    $(".delete-photo").hide();
                } else {
                    $("#profile_picture_comment").addClass("text-error")
                        .text("Failed to remove.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#profile_picture_comment").addClass("text-error")
                    .text("Failed to remove.");
            }
        });
    };

    this.updateAccount = function (uv) {
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

                    if (data.firstname) {
                        $(".banner-welcome-title").text("Hello, " + data.firstname + "!");
                    } else {
                        $(".banner-welcome-title").text("Hello, " + data.user + "!");
                    }
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
    };

    this.deleteAccount = function (dv) {
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
    };

    // Do logout
    this.attemptLogout = function () {
        $.ajax({
            url: "/logout",
            type: "POST",
            success: function (data, textStatus, jqXHR) {
                if (!data.error) {
                    window.location.href = "/";
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Logout failed!");
            }
        });
    };
};