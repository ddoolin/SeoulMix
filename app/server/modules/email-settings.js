module.exports = {
    host: "smtp.gmail.com",
    user: process.env["DISPATCH_EMAIL"],
    password: process.env["DISPATCH_EMAIL_PASS"],
    sender: "SeoulMix <contact@seoulmix.com>"
};