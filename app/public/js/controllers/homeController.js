function HomeController() {
    
    var that = this;

    // Logout confirmation
    $("#navbar_logout").click(function() {
        if (window.confirm("Are you sure you want to log out?")) {
            that.attemptLogout();
        }
    });

    // Remove profile picture
    $("#delete_photo").click(function() {
        if (window.confirm("Are you sure you want to remove your picture?")) {
            that.removePhoto();
        }
    });

    // Need to use a JS trigger to prevent this ajaxForm from submitting on click
    $("#delete_account").click(function(event) {
        event.preventDefault();
        $("#profile_modal").modal("hide");
        $("#deleteacct_modal").modal("show");
    });

    // Field focusing
    $("#profile_modal").on("shown", function() {
        $("#update_firstname").focus();
    }).on("hidden", function() {
        $("#update_firstname").blur();
    });

    $("#deleteacct_modal").on("shown", function() {
        $("#delete_password").focus();
    }).on("hidden", function() {
        $("#delete_password").blur();
    });

    // If the user changes profile username field, they edited
    // the HTML node. Append a warning even though it's not processed.
    $("#update_username").change(function() {
        $(".update-username-comment").addClass("error").text("Username cannot be changed!");
    });

    // Emulate a click on the hidden input field
    $("#choose_existing_photo_link").click(function() {
        $("#choose_existing_photo").click();
    });

    // Do logout
    this.attemptLogout = function() {
        $.ajax({
            url: "/home",
            type: "POST",
            data: { logout: true },
            success: function() {
                window.location.href = "/";
            },
            error: function(err) {
                alert("Logout failed!");
            }
        });
    }

    // Remove profile photo
    this.removePhoto = function() {
        $.ajax({
            url: "/update-profilepic",
            type: "POST",
            data: { remove: true },
            success: function() {
                $("#profile_picture").attr("src", "/img/default-profile.png");
                $("#profile_picture_comment").addClass("text-success")
                    .text("Photo successfully removed.");
                $(".delete-photo").hide();
            },
            error: function(err) {
                $("#profile_picture_comment").addClass("text-error")
                    .text("Failed to remove. Please try again.");
            }
        });
    }
}