$(document).ready(function () {

	// Set the cloudinary config
	$.cloudinary.config({
		"api_key": "389689266184749",
		"cloud_name": "seoulmix"
	});

	// Options to pass to the map instance
	var mapOptions = {
		center: new google.maps.LatLng(37.525, 127.000),
		zoom: 12,
		streetViewControl: false,
		panControl: false	,
		mapTypeControl: false,
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// Instantiate the map and pass options
	var map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions),
		geocoder = new google.maps.Geocoder(),
		location,
		coordArray = [];

	$.ajax({
		url: "/api/events",
		type: "GET",
		success: function (data, textStatus, jqXHR) {
			for (var i = 0; i < data.length; i++) {
				populateMap(data[i]);
			}
		}
	});

	var infoWindow;

	var populateMap = function (data) {
		var event = data,
			latLng,
			marker,
			content;

		latLng = new google.maps.LatLng(event.location.lat, event.location.lng);
		marker = new google.maps.Marker({
			map: map,
			position: latLng,
			animation: google.maps.Animation.DROP,
			title: event.name
		});

		content = "<div id='content'>" +
			"<div id='siteNotice'></div>" +
			"<h2 id='firstHeading' class='firstHeading'>" + event.name +
			"</h2><div id='bodyContent'>" +
			"<p>" + event.description + "</p>" +
			"</div>" +
			"</div>";

		google.maps.event.addListener(marker, "click", function () {
			if (infoWindow) {
				infoWindow.close();
			}

			infoWindow = new google.maps.InfoWindow({
				content: content
			});

			infoWindow.open(map, marker);
		});
	};
});
