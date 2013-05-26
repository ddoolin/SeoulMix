window.SeoulMix.eventValidator = function () {

	var that = this;

	this.createEvent = $("#create_event_modal");
	this.createEventAlert = $(".event-alert");
	this.formFields = [$("#event_name"), $("#event_description"),
		$("#event_location")];

	this.commentFields = [$(".event-name-comment"),
		$(".event-description-comment"), $(".event-location-comment"),
		$(".event-time-comment")];

    this.resetCommentFields = function () {

        for (var i = 0; i < that.commentFields.length; i++) {
            that.commentFields[i].removeClass("text-error").text("");
        }
    };

	this.validateName = function (name) {
		return name.length > 0
	};

	this.validateLocation = function (location) {
		return location.length > 0
	};

	this.showErrors = function (type, msg) {
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
			case "time":
				that.commentFields[3].addClass("text-error").text(msg);
		}
	};

	this.getLocation = function (address, callback) {
		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({
			"address": 	address,
			"region": 	"KR"
		}, function (results, status) {
			if (status !== "OK" && status !== "ZERO_RESULTS") {
				callback({"error":"An error has occured"});
				return false;
			} else if (status === "ZERO_RESULTS") {
				callback({"error":"Address not found"});
				return false;
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

	this.validateTime = function () {
		var now = new Date(),
			startDay = $("#from_date").val(),
			startTime = $("#from_time").val(),
			endDay = $("#to_date").val(),
			endTime = $("#to_time").val(),
			startDate = new Date(startDay + " " + startTime),
			endDate = new Date(endDay + " " + endTime);

		if (!startDay || !startTime || !endDay || !endTime) {
			return "Blank field";
		}
		if (startDate < now || endDate < now) {
			return "Past";
		}
		if (startDate > endDate) {
			return "Start after finish";
		}
		if (startDate == "Invalid Date" || endDate == "Invalid Date") {
			return "Invalid date";
		}
	};

	this.showCreateSuccess = function (msg) {
		$(".event-submit-comment").html(msg);
		that.createEventAlert.show();
	};

	this.validateForm = function () {
		var dateMsg;

		if (that.validateName(that.formFields[0].val()) ===  false) {
			that.showErrors("name", "Event name cannot be blank");
			return false;
		}
		if (that.validateLocation(that.formFields[2].val()) === false) {
			that.showErrors("location", "Location cannot be blank");
			return false;
		}

		dateMsg = that.validateTime();
		if (dateMsg) {
			switch (dateMsg) {
				case "Blank field":
					that.showErrors("time", "Times cannot be blank");
					break;
				case "Past":
					that.showErrors("time", "Times cannot be in the past");
					break;
				case "Start after finish":
					that.showErrors("time", "End time must come after the start time");
					break;
				case "Invalid date":
					that.showErrors("time", "Invalid time");
					break;
			};

			return false;
		}

		return true;
	};
};