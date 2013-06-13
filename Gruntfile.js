module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        less: {
            seoulmix: {
                options: {
                    paths: ["app/public/css"],
                    yuicompress: true
                },
                files: {
                    "app/public/seoulmix.css": ["app/public/css/main.less",
                                                "app/public/css/vendor/*.css"]
                }
            }
        },
        concat: {
            seoulmix: {
                options: {
                    separator: ";"
                },
                src: ["app/public/js/application.js",
                      "app/public/js/websockets.js",
                      "app/public/js/vendor/*.js",
                      "app/public/js/controllers/*.js",
                      "app/public/js/form-validators/*.js",
                      "app/public/js/views/*.js"],
                dest: "app/public/seoulmix.js"
            }
        },
        uglify: {
            seoulmix: {
                options: {
                    beautify: true,
                    mangle: { toplevel: true },
                    squeeze: { dead_code: false },
                    codegen: { quote_keys: true },
                    preserveComments: false,
                    compression: true
                },
                src: "app/public/seoulmix.js",
                dest: "app/public/seoulmix.min.js"
            }
        },
        watch: {
            options: {
                livereload: 8081
            },
            styles: {
                files: ["app/public/css/*.less", "app/public/css/vendor/*.css"],
                tasks: ["less:seoulmix"],
            },
            scripts: {
                files: ["app/public/js/**/*.js"],
                tasks: ["concat:seoulmix", "uglify:seoulmix"],
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // Tasks
    grunt.registerTask("default", ["watch"])
}
