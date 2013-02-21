var ES = require("./email-settings");
var EM = {};

module.exports = EM;

EM.server = require("emailjs/email").server.connect({
    host: ES.host,
    user: ES.user,
    password: ES.password,
    ssl: true
});

EM.dispatchResetPasswordLink = function(account, callback)
{
    EM.server.send({
        from         : ES.sender,
        to           : account.email,
        subject      : 'SeoulMix Password Reset',
        text         : 'something went wrong... :(',
        attachment   : EM.composeEmail(account)
    }, callback );
}

EM.composeEmail = function(account) {
    var link = "http://localhost/reset-password?e=" + account.email + "&p=" + account.pass;
    var html = "<html><body>";
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

    return  [{data: html, alternative: true}];
}