module.exports = {
    host: "smtp.gmail.com",
    user: process.env["DISPATCH_EMAIL"],
    password: ["DISPATCH_EMAIL_PASS"],
    sender: "SeoulMix <contact@seoulmix.com>"
};