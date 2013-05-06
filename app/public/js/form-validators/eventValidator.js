function EventValidator() {

	var that = this;

	that.createEvent = $("#create_event_model");
	that.formFields = [$(".event-name"), $(".event-description")]

	that.validateName = function (name) {
		return name.length >= 0
	}
}

EventValidator.prototype.validateForm = function () {
	if (this.validateName(this.formFields[0].val()) ===  false) {
		console.log("Invalid name");
		return false;
	}

	return true;
}