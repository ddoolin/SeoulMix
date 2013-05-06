var express = require("express"),
    path = require("path"),
    cloudinary = require("cloudinary");

var app = express();

app.configure(function() {
	app.set("port", 8081);
	app.set("views", __dirname + "/app/server/views");
	app.set("view engine", "jade");
	app.use(express.logger("dev"));
	app.use(express.bodyParser({
        uploadDir: "./uploads",
        keepExtensions: true
    }));
	app.use(express.cookieParser());
	app.use(express.session({
        secret: "d4SPw4mz2",
        cookie: {
            expires: false
        }
    }));
	app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname + '/app/public')));
  cloudinary.config({ cloud_name: "seoulmix", api_key: "389689266184749", api_secret: "KTTzUc77y2DACiZpYrlqKH9ZAi8" });
});

app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});

app.locals.cloudinary_api_key = cloudinary.config().api_key;
app.locals.cloudinary_cloud_name = cloudinary.config().cloud_name;

require('./app/router')(app);

app.listen(app.get('port'), function() {
	console.log("HTTP server listening on port " + app.get('port'));
});