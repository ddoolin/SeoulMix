window.SeoulMix.mainController = function () {

    var that = this,
        map = window.SeoulMix.map,
        infoWindow = new google.maps.InfoWindow();

    this.formatDate = function (date) {
        // Change from "Wed May 29 2013" to "Wednesday, May 29, 2013" and return
    }

    this.formatTime = function (date) {
        // Change from "23:0" to "11:00 PM" and return
    }

    this.createMarker = function (position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
            marker;

        marker = new google.maps.Marker({
            map: map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        return marker;
    };

    this.createInfoWindow = function (markup, marker, event) {
        var time = new Date(event.startTime);

        if (!markup) {
            markup = "<div class='content'>" +
                "<h3 class='firstHeading'>" + event.name +
                "</h3><div class='bodyContent'>" +
                "<p class='time'>" + time.toDateString() +
                " @ "+ time.getHours() +":" + time.getMinutes() + "</p>" +
                "<p class='description'>" + event.description + "</p>" +
                "</div>" +
                "</div>";
        }

        google.maps.event.addListener(marker, "click", function () {
            infoWindow.close();
            infoWindow.setContent(markup);
            infoWindow.open(window.SeoulMix.map, this);
        });
    };

    this.createColoredMarker = function (color, position) {
        var position = (position == undefined) ? new google.maps.LatLng(37.525, 127.000) : new google.maps.LatLng(position[0], position[1]),
            marker,
            image,
            shadow;

        image = new google.maps.MarkerImage("images/" + color + "-marker.png",
            new google.maps.Size(32, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        shadow = new google.maps.MarkerImage("images/marker-shadow.png",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 32));

        marker = new google.maps.Marker({
            map: window.SeoulMix.map,
            position: position,
            draggable: true,
            animation: google.maps.Animation.DROP,
            shadow: shadow,
            icon: image
        });

        return marker;
    };
};