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

	that.validateLocation = function (location) {
		return location.length > 0
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

EventValidator.prototype.getLocation = function (address, callback) {
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({
		"address": 	address,
		"region": 	"KR"
	}, function (results, status) {
		if (status !== "OK" && status !== "ZERO_RESULTS") {
			callback({"error":"An error has occured"});
		} else if (status === "ZERO_RESULTS") {
			callback({"error":"Address not found"});
		}

		r = results[0]

		// Since we want to allow mixing in Seoul AND the surrounding area,
		// We will only check if the address is in Korea.
		for (var i = 0; i < r.address_components.length; i++) {
			for (var j = 0; j < r.address_components[i].types.length; j++) {
				if (r.address_components[i].types[j] === "country" &&
					r.address_components[i].short_name !== "KR") {

					callback({"error": "Not in Korea"});
				}
			}
		}

		callback(r);
	});
};

EventValidator.prototype.showCreateSuccess = function (msg) {
	$(".event-submit-comment").html(msg);
	this.createEventAlert.show();
}

EventValidator.prototype.validateForm = function () {
	if (this.validateName(this.formFields[0].val()) ===  false) {
		this.showErrors("name", "Event name cannot be blank");
		return false;
	}
	if (this.validateLocation(this.formFields[2].val()) === false) {
		this.showErrors("location", "Location cannot be blank");
		return false;
	}

	return true;
}