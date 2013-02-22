function HomeController() {
    
    var that = this;

    $("#navbar_logout").click(function() {
        if (window.confirm("Are you sure you want to log out?")) {
            that.attemptLogout();
        }
    });

    this.attemptLogout = function() {
        var that = this;
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

    this.deleteAccount = function() {
        // Delete account
    }
}