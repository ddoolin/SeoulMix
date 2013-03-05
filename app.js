var express = require("express");
var http = require("http");
// var https = require("https");
// var fs = require("fs");

// var options = {
//     key: fs.readFileSync("key.pem"),
//     cert: fs.readFileSync("cert.pem")
// };

var app = express();

app.configure(function() {
	app.set("port", 80);
	app.set("views", __dirname + "/app/server/views");
	app.set("view engine", "jade");
	app.use(express.favicon(__dirname + "/app/public/img/favicon.ico"));
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
	app.use(express.static(__dirname + '/app/public'));
});

app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler()); 
});


require('./app/router')(app);

http.createServer(app).listen(app.get('port'), function() {
	console.log("HTTP server listening on port " + app.get('port'));
});

// https.createServer(options, app).listen(443, function() {
//     console.log("HTTPS server listening on port 443");
// });