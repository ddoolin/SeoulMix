(function ($) {

    var seoulmix = window.SeoulMix,
        rc = new seoulmix.resetController(),
        rv = new seoulmix.resetValidator();

    $("#newpass_submit").click(function (event) {
        event.preventDefault();

        rc.resetPass(rv);
    });

    $("#new_password").focus();
})(jQuery);