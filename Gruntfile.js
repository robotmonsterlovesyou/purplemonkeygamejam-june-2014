module.exports = function (grunt) {

    'use strict';

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jslint: {

            client: {
                src: ['js/**/*.js'],
                directives: {
                    nomen: true,
                    globals: {
                        'document': true,
                        'define': true,
                        'module': true,
                        'require': true,
                        'window': true
                    }
                }
            }

        },

        watch: {

            default: {
                files: ['js/**/*.js'],
                tasks: ['jslint']
            }

        }

    });

    grunt.registerTask('default', [ 'jslint' ]);

};
