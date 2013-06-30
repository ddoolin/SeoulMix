window.SeoulMix.mainController = function () {

    var that = this,
        map = window.SeoulMix.map,
        infoWindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

    this.formatDate = function (date) {

        // Change from "Wed May 29 2013" to "Wednesday, May 29, 2013" and return
        var date = new Date(date),
            days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday"],
            day = days[date.getDay()],
            months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            month = months[date.getMonth()],
            monthDay = date.getDate(),
            year = date.getFullYear(),
            formattedDate = day + ", " + month + " " + monthDay + ", " + year;

        return formattedDate;
    }

    this.formatTime = function (date) {

        // Change from "23:0" to "11:00 PM" and return
        var date = new Date(date),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            meridiem = "am",
            formattedTime;

        if (hour > 12) {
            hour = hour - 12,
            meridiem = "pm";
        } else if (hour === 12) {
            meridiem = "pm";
        } else if (hour === 0) {
            hour = 12;
            meridiem = "am";
        }

        formattedTime = hour + ":" + (((minutes < 10) ? "0" : "") + minutes) + " " + meridiem;

        return formattedTime;
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
        var time;

        if (!markup) {
            markup = "<div class='content'>" +
                "<a href='/events/" + event._id + "'>" + 
                "<h3 class='firstHeading'>" + event.name +
                "</h3></a><div class='bodyContent'>";

            if (event.startTime) {
                time = new Date(event.startTime);

                markup += "<p class='time'>" + that.formatDate(time) +
                " @ "+ that.formatTime(time) + "</p>";
            }

            markup += "<p class='description'>" + event.description + "</p>" +
                "</div>" +
                "</div>";
        }

        google.maps.event.addListener(marker, "click", function () {
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