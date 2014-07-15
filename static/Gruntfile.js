module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            options: {
            },
            scripts: {
                files: ['src/*.js', 'src/*.html'],
                tasks: ['process']
            }
        },
        concat: {
            dist: {
                src: ['src/*.js'],
                dest: 'dist/js/all.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '/* Created by Istergul */\n'
                },
                files: {
                    'dist/js/all.min.js': ['dist/js/all.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('process', ['concat', 'uglify']);
    grunt.registerTask('default', ['concat', 'uglify', 'watch']);
};
