/*
 * grunt-webworks-developer
 * https://github.com/jliverse/grunt-webworks-developer
 *
 * Copyright (c) 2013 Joe Liversedge
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    webworks_deploy: {
      facebook_bb10: {
        options: {
          sdk: '/Developer/WebWorksBB10',
          file: 'build/device/facebookbb10.bar',
          ip: '10.0.1.12',
          password: '9999'
        }
      },
      facebook_playbook: {
        options: {
          sdk: '/Developer/WebWorksTabletOS',
          file: 'build/facebookplaybook.bar',
          ip: '10.0.1.7',
          password: '9999'
        }
      },
    },
    webworks_package: {
      options: {
        src: [ 'facebook', 'facebook_extras' ],
        target: 'build',
        keypass: 'storepass',
      },
      facebook_bb10: {
        options: {
          sdk: '/Developer/WebWorksBB10',
          name: 'facebookbb10'
        }
      },
      facebook_playbook: {
        options: {
          sdk: '/Developer/WebWorksTabletOS',
          name: 'facebookplaybook'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'webworks_developer', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
