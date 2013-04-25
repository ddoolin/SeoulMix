module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        less: {
            development: {
                options: {
                    paths: ["app/public/css/"]
                },
                files: {
                    "app/public/css/main.css": "app/public/css/main.less",
                }
            },
            production: {
                options: {
                    paths: ["app/public/css"],
                    yuicompress: true
                },
                files: {
                    "app/public/css/main.css": "app/public/css/main.less",
                }
            }
        },
        watch: {
            styles: {
                files: ["app/public/css/**/*.less"],
                tasks: ["less:development"],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Tasks
    grunt.registerTask("default", ["watch"])
}
