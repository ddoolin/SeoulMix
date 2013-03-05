"use strict";

var ES = require("./email-settings"),
    ED = {};

module.exports = ED;

ED.server = require("emailjs/email").server.connect({
    host: ES.host,
    user: ES.user,
    password: ES.password,
    ssl: true
});

ED.dispatchPasswordResetLink = function (account, callback) {
    ED.server.send({
        from         : ES.sender,
        to           : account.email,
        subject      : 'SeoulMix Password Reset',
        text         : 'Something went wrong... :(',
        attachment   : ED.composePasswordResetEmail(account)
    }, function (err, msg) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, msg);
        }
    });
};

ED.composePasswordResetEmail = function (account) {
    var link = "http://localhost/reset-password?e=" + account.email + "&p=" + account.pass,
        html = "<html><body>";

    if (account.firstname) {
        html += "Hi " + account.name + ",<br><br>";
    } else {
        html += "Hello! <br><br>";
    }
    html += "Your username is: <b>" + account.user + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to reset your password</a><br><br>";
    html += "Cheers,<br>";
    html += "<a href='http://localhost'>SeoulMix</a><br><br>";
    html += "</body></html>";

    return [{data: html, alternative: true}];
};