var AM = require("./modules/account-manager");
var EM = require("./modules/email-dispatcher");

module.exports = function(app) {

	// Main page
	app.get("/", function(req, res) {
		if (req.session.user == undefined) {
				res.render("front");
		} else {
			AM.autoLogin(req.session.user.user, req.session.user.pass, function(result) {

				if (result != null) {
					req.session.user = result;
					res.redirect("/home");
				} else {
					res.render("front");
				}
			})
		}
	});

	app.post("/", function(req, res) {
		AM.manualLogin(req.param("login-username"), req.param("login-password"), function(err, result) {
			if (!result) {
				res.send(err, 400);
			} else {
				req.session.user = result;

				if (req.param("remember-me") == "true") {
					// 24 hours
					req.session.cookie.maxAge = 86400000;
				}

				res.send(result, 200);
			}
		});
	});

	app.post("/lost-password", function(req, res) {
		AM.getAccountsByEmail(req.param("lostpass-email"), function(result) {
			if (result) {
				res.send("OK", 200);
				EM.dispatchResetPasswordLink(result, function(err, msg) {
					if (!err) {
						res.send("OK", 200);
					} else {
						res.send("email-server-error", 400);
						for (each in err) {
							console.log("Error: ", each, err[each]);
						}
					}
				});
			} else {
				res.send("email-not-found", 400);
			}
		});
	});

	app.get("/reset-password", function(req, res) {
		var email = req.query["e"];
		var passhash = req.query["p"];

		if (!email || !passhash) {
			res.redirect("/");
		}

		AM.validateResetLink(email, passhash, function(response) {
			if (response != "OK") {
				res.redirect("/");
			} else {
				req.session.reset = {
					email: email,
					passhash: passhash
				};
				res.render("reset");
			}
		});
	});

	app.post("/reset-password", function(req, res) {
		var newpass = req.param("pass");
		var email = req.session.reset.email;

		req.session.destroy();
		AM.updatePassword(email, newpass, function(result) {
			if (result) {
				res.send("OK", 200);
			} else {
				res.send("Unable to update password", 400);
			}
		});
	});

	app.post("/signup", function(req, res) {
		AM.addNewAccount({
			user: 	req.param("signup-username"),
			pass: 	req.param("signup-password"),
			email: 	req.param("signup-email")
		}, function(err) {
			if (err) {
				res.send(err, 400);
			} else {
				res.send("OK", 200);
			}
		});
	});

	app.get("/home", function(req, res) {
		if (req.session.user == null) {
			res.redirect("/");
		} else {
			res.render("home", {
				userdata: req.session.user
			});
		}
	});

	app.post("/home", function(req, res) {
		if (req.param("user") != undefined) {
			// Stuff
		} else if (req.param("logout") == "true") {
			res.clearCookie("user");
			res.clearCookie("pass");
			req.session.destroy(function(err) {
				res.send("OK", 200);
			});
		}
	});

	app.get("*", function(req, res) {
		res.render("404");
	});
};