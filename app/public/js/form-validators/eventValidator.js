function EventValidator() {

	var that = this;

	that.createEvent = $("#create_event_modal");
	that.createEventAlert = $(".event-alert");
	that.formFields = [$("#event_name"), $("#event_description"),
		$("#event_location")];

	that.commentFields = [$(".event-name-comment"),
		$(".event-description-comment"), $(".event-location-comment")];

    that.resetCommentFields = function () {

        for (var i = 0; i < that.commentFields.length; i++) {
            that.commentFields[i].removeClass("text-error").text("");
        }
    }

	that.validateName = function (name) {
		return name.length > 0
	}

	that.validateLocationLength = function (location) {
		return location.length > 0
	}

	that.validateLocation = function (location) {
		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({
			"address": location,
			"region": "KR"
		}, function (results, status) {
			debugger;
			if (status !== "OK") {
				return false;
			}
		});
	}

	that.showErrors = function (type, msg) {
		switch (type) {
			case "name":
				that.commentFields[0].addClass("text-error").text(msg);
				break;
			case "description":
				that.commentFields[1].addClass("text-error").text(msg);
				break;
			case "location":
				that.commentFields[2].addClass("text-error").text(msg);
				break;
		}
	}
}

EventValidator.prototype.showCreateSuccess = function (msg) {
	$(".event-submit-comment").html(msg);
	this.createEventAlert.show();
}

EventValidator.prototype.validateForm = function () {
	if (this.validateName(this.formFields[0].val()) ===  false) {
		this.showErrors("name", "Event name cannot be blank");
		return false;
	}
	if (this.validateLocationLength(this.formFields[2].val()) === false) {
		this.showErrors("location", "Location cannot be blank");
		return false;
	}
	if (this.validateLocation(this.formFields[2].val()) === false) {
		this.showErrors("location", "Location could not be found");
		return false;
	}

	return true;
}