function HomeController() {
    
    var that = this;

    // Logout confirmation
    $("#navbar_logout").click(function() {
        if (window.confirm("Are you sure you want to log out?")) {
            that.attemptLogout();
        }
    });

    // Need to use a JS trigger to prevent ajaxForm from submitting on click
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

    // Do logout
    this.attemptLogout = function() {
        $.ajax({
            url: "/home",
            type: "POST",
            data: {logout: true},
            success: function(data) {
                window.location.href = "/";
            },
            error: function(jqXHR) {
                console.log(jqXHR.responseText + " :: " + jqXHR.statusText);
            }
        });
    }
}