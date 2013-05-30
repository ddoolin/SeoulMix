$(document).ready(function () {

    var seoulmix = window.SeoulMix,
        hc = new seoulmix.homeController(),
        ev = new seoulmix.eventValidator(),
        uv = new seoulmix.updateProfileValidator(),
        dv = new seoulmix.deleteValidator();

    // Instantiate alerts
    $(".event-alert").alert();

    // Instantiate datepickers
    $("#from_date").datepicker({
        minDate: new Date(),
        altField: $("#from_date"),
        dateFormat: "m/d/yy"
    });
    $("#to_date").datepicker({
        minDate: new Date(),
        altField: $("#to_date"),
        dateFormat: "m/d/yy"
    });

    // Set the times to default
    ev.setDefaultTimes();

    $("#from_time, #to_time").focus(function (event) {
        $(event.target).siblings(".hour-select").show();
    }).keydown(function (event) {
        $(event.target).siblings(".hour-select").hide();
    }).blur(function (event) {
        $(event.target).siblings(".hour-select").hide();
    });

    $(".hour").mousedown(function (evt) {
        parentInput = $(evt.target).parent().siblings().get(1);
        $(parentInput).val($(evt.target).text());
        $(event.target).parent().hide();
    });

    // "Find on Map"
    $("#find_location").click(function (event) {
        event.preventDefault();

        hc.findOnMap();
    });

    $("#location_finder_popup .help").tooltip({
        title: "Enter an address and press find to drop the marker on that location (if it exists). Drag and drop the marker around the map to find more precise addresses.",
        placement: "top"
    });

    // Create new event
    $("#event_submit").click(function (event) {
        event.preventDefault();

        hc.createEvent(ev);
    });

    $("#from_date, #to_date").focus(function (event) {
        $(event.target).datepicker("show");
    });

    // Update profile picture
    $("#choose_existing_photo").on("change", function (event) {
        hc.updatePhoto(uv, event);
    });

    // Remove profile picture
    $("#delete_photo").click(function () {
        if (window.confirm("Are you sure you want to remove your picture?")) {
            hc.removePhoto();
        }
    });

    // Update profile
    $("#update_submit").click(function (event) {
        event.preventDefault();

        hc.updateAccount(uv);
    });

    // Delete account
    $("#delete_confirm").click(function (event) {
        event.preventDefault();

        hc.deleteAccount(dv);
    });

    // Logout confirmation
    $("#navbar_logout").click(function () {
        if (window.confirm("Are you sure you want to log out?")) {
            hc.attemptLogout();
        }
    });

    $("#create_event_modal #clear_form").click(function (event) {
        event.preventDefault();

        ev.resetFields();
    });

    $(".event-alert .close").click(function (event) {
        event.preventDefault();

        $(".event-alert").hide();
    });

    // Need to use a JS trigger to prevent this ajaxForm from submitting on click
    $("#delete_account").click(function (event) {
        event.preventDefault();

        $("#profile_modal").modal("hide");
        $("#deleteacct_modal").modal("show");
    });

    // Field focusing
    $("#create_event_modal").on("shown", function () {
        $("#event_name").focus();
    }).on("hidden", function () {
        $("#event_name").blur();
    });

    $("#profile_modal").on("shown", function () {
        $("#update_firstname").focus();
    }).on("hidden", function () {
        $("#update_firstname").blur();
    });

    $("#deleteacct_modal").on("shown", function () {
        $("#delete_password").focus();
    }).on("hidden", function () {
        $("#delete_password").blur();
    });

    // If the user changes profile username field, they edited
    // the HTML node. Append a warning even though it's not processed.
    $("#update_username").change(function () {
        $(".update-username-comment").addClass("error").text("Username cannot be changed!");
    });

    // Emulate a click on the hidden input field
    $("#choose_existing_photo_link").click(function () {
        $("#choose_existing_photo").click();
    });
});
