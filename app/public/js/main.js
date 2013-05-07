
$(document).ready(function() {

	// Initializing and populating the map --

	// Doesn't work with Korea...can't style maps -- all features disappear

	// var mapStyles = [{
	// 	featureType: "all",
	// 	elementType: "all",
	// 	stylers: [
	// 		{visibility: "on"},
	// 		{saturation: -100},
	// 		{gamma: 1.94}
	// 	]
	// }];

	// Options to pass to the map instance
	var mapOptions = {
		center: new google.maps.LatLng(37.525, 127.000),
		zoom: 12,
		streetViewControl: false,
		panControl: false,
		mapTypeControl: false,
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// Instantiate the map and pass options
	var map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions);

	// ! Marker testing!
	var addressArray = new Array("Namsan, Seoul, Korea", "Yonsei University",
								"Banpo Bridge, Seoul, Korea", "Gangnam, Seoul",
								"Gwanaksan, Seoul, Korea", "Seoul National University",
								"Hanguk University of Foreign Studies",
								"Korea University", "Dongdaemun", "Sindorim Station",
								"여의도공원");

	var geocoder = new google.maps.Geocoder();

	for (var i = 0; i < addressArray.length; i++) {
		geocoder.geocode({
			'address': addressArray[i]
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
			} else {
				console.log("Geocode was not successful: " + status);
			}
		});
	}
	// ! End marker testing!
});
