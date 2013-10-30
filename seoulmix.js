var express = require("express"),
    path = require("path"),
    cloudinary = require("cloudinary"),
    app = express(),
    server = require("http").createServer(app);

// Default application settings
app.configure(function() {
  // Application port
	app.set("port", 8081);

  // View settings
	app.set("views", path.join(__dirname + "/app/server/views"));
	app.set("view engine", "jade");

  // Logging/error handling
	app.use(express.logger());
  app.use(express.errorHandler());

  // Parses the request body (req.body)
	app.use(express.bodyParser({
        uploadDir: "./uploads",
        keepExtensions: true
    }));

  // Session/cookie settings
	app.use(express.cookieParser());
	app.use(express.session({
        secret: "d4SPw4mz2",
        cookie: {
            expires: false
        }
    }));

  // Needed to use PUT and DELETE methods
	app.use(express.methodOverride());

  // Backup static directory methods, in case Nginx isn't serving
  app.use(express.static(path.join(__dirname + '/app/public')));

  // Set our Cloudinary URL
  cloudinary.config(process.env["CLOUDINARY_URL"]);
});

// Legacy for NODE_ENV === 'development'
app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Instantiate the router with our application
require('./app/router')(app);

// Server kick-off
server.listen((process.env["PORT"] || app.get('port')), function() {
	console.log("HTTP server listening on port " + (process.env["PORT"] || app.get('port')));
});