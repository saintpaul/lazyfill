module.exports = function (grunt) {
  'use strict';

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    browserify: {
      live: {
        files: {
          '.tmp/lazyfill.js'         : 'sources/Core.js',
        }
      },
      build: {
        files: {
          'build/lazyfill.js'         : 'sources/Core.js',
        }
      }
    },

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        mangle: true,
        sourceMap: true,
        sourceMapName: 'build/lazyfill.min.js.map',
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:mm") %> */'

      },
      build: {
        files: {
          'build/lazyfill.min.js': [ 'build/lazyfill.js' ]
        }
      }
    },


    // The actual grunt server settings
    connect: {
      options: {
        port: 9001,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            'app'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            'app'
          ]
        }
      },
      build: {
        options: {
          base: 'build'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'sources/{,*/}*.js'
      ]
    },

    // Empties folders to start fresh
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'build/*',
            '!build/.git*'
          ]
        }]
      },
      server: '.tmp'
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'build') {
      return grunt.task.run(['build', 'connect:build:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'browserify:live',
      'connect:livereload',
      'watch'
    ]);
  });


  grunt.registerTask('build', [
    'clean:build',
    'browserify:build',
    'uglify:build'
  ]);


  grunt.registerTask( 'default', [
    'build'
  ]);
};
