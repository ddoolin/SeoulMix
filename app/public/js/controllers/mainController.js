window.SeoulMix.mainController = function () {

	var that = this;

	this.createMarker = function (position) {
		var map = window.SeoulMix.map,
			position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
			marker;

		marker = new google.maps.Marker({
			map: map,
			position: position,
			draggable: true,
			animation: google.maps.Animation.DROP
		});

		return marker;
	};
};