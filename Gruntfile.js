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
                    "app/public/css/mixins.css": "app/public/css/mixins.less"
                }
            },
            production: {
                options: {
                    paths: ["app/public/css"],
                    yuicompress: true
                },
                files: {
                    "app/public/css/main.css": "app/public/css/main.less",
                    "app/public/css/mixins.css": "app/public/css/mixins.less"
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-less");

    // Tasks
    grunt.registerTask("default", ["less:development"])
}