/*
 * grunt-webworks-developer
 * https://github.com/jliverse/grunt-webworks-developer
 *
 * Copyright (c) 2013 Joe Liversedge (@jliverse)
 * Licensed under the MIT license.
 *
 * Inspired by blackberry-build by Kevin Kazmierczak
 * https://github.com/kazmiekr/blackberry-build
 * Copyright (c) 2013 Kevin Kazmierczak
 */

'use strict';

module.exports = function(grunt) {

  var fs = require('fs'),
      path = require('path'),
      shell = require('shelljs'),
      archiver = require('archiver'),
      packaging = {
        bb10 : '/bbwp',
        playbook: '/bbwp/bbwp'
      },
      deployment = {
        bb10 : '/dependencies/tools/bin/blackberry-deploy',
        playbook: '/bbwp/blackberry-tablet-sdk/bin/blackberry-deploy'
      },
      pathWithSdk = function(sdk, file) {
        // TODO: This might need some better (read: any)
        // checking for directory separators.
        return sdk + file;
      },
      sdkIsBlackBerry10 = function(sdk) {
        return grunt.file.exists(sdk + deployment.bb10);
      },
      sdkIsPlayBook = function(sdk) {
        return grunt.file.exists(sdk + deployment.playbook);
      };

  /* Register the 'webworks_package' task.
  ****************************************************************************/
  grunt.registerMultiTask('webworks_package', 'For BlackBerry WebWorks developers, a plugin to support packaging WebWorks apps for BlackBerry OS 10 and Tablet OS devices.', function() {

    var options = this.options({
      name: 'app',
      target: '.'
    });
    grunt.verbose.writeflags(options, 'Options');
    
    if (!options.sdk) {
      grunt.fatal('A WebWorks SDK path is required in option "sdk".');
		}

		// Check that the SDK path exists.
		options.sdk = path.resolve(options.sdk);
		if (!grunt.file.exists(options.sdk)) {
      grunt.fatal('A WebWorks SDK path does not exist at "' + options.sdk + '".');
    }

    // Check that the target path exists.
    options.target = path.resolve(options.target);

    var command = undefined,
        isBlackBerry10 = sdkIsBlackBerry10(options.sdk),
        isPlayBook = sdkIsPlayBook(options.sdk);
        
    // Copy all the files (temporarily) into a new source directory.
    if (!options.src || !Array.isArray(options.src)) {
      grunt.fatal('An array of source directories is required in option "src".');
    }
    
    // Write all of the source directories into the same temporary location.
    // This lets us do things like override certain files without affecting
    // filenames used by other build processes. (When used to build Android
    // apps, the PhoneGap config.xml has different requirements than the
    // WebWorks config.xml. Everything else can be shared. Usually.)
    var appBuildPath = options.target + '/' + options.name,
        shouldCleanBuildPath = !grunt.file.exists(path.resolve(appBuildPath));
        
    // Also, make sure we only copy over paths we create as an extra check
    // against something horrible. A user could make a mistake in the
    // configuration or create pathologically bizarre symlinks that could
    // result in this task deleting or overwriting their data by mistake.
    // Do. Not. Want.
    if (grunt.file.exists(appBuildPath)) {
      grunt.fatal('The app build path "' + appBuildPath + '" already exists. You will need to move or remove this directory to continue.');
    }

    // Iterate through all the source directories.
    options.src.forEach(function(directory) {
      if (!grunt.file.exists(directory)) {
        grunt.log.warn('The source directory "' + directory + '" does not exist.');
        return;
      }
      // And all the files.
      grunt.file.recurse(directory, function(fullPath, root, subdirectory, filename) {
        // Construct the path relative to the source directory.
        var relativePath = [].concat(subdirectory ? [ subdirectory, filename ] : filename).join('/');
        grunt.file.copy(fullPath, appBuildPath + '/' + relativePath);
      });
    });

    if (isBlackBerry10) {

      // i.e., /SDK/bbwp" www -o build -g mystorepass
      command = '"' + pathWithSdk(options.sdk, packaging.bb10) + '" ' + appBuildPath + ' -o ' + options.target;
      options.keypass && (command += ' -g ' + options.keypass);
      options.flags && (command += ' ' + options.flags);
      grunt.log.writeln(String(command).blue);
      shell.exec(command);
      
      // Delete our temporary build directory only if we created it.
      if (shouldCleanBuildPath) {
        grunt.file.delete(path.resolve(appBuildPath));
      }
    } else if (isPlayBook) {

      // BlackBerry PlayBook
      /////////////////////////////////////////////////////////////////////////

      // Create the .zip bundle containing the WebWorks source files.
      var zip = options.target + '/' + options.name + '.zip',
          done = this.async(),
          output = fs.createWriteStream(zip);
      
      // Wait until the .zip file is closed, then convert into a Tablet OS .bar file.
      output.on('close', function() {

        // Create the BlackBerry PlayBook .bar package.
        // i.e., /SDK/bbwp/bbwp" build/apptabletos.zip -o build -g mystorepass
        command = '"' + pathWithSdk(options.sdk, packaging.playbook) + '" "' + path.resolve(zip) + '" -o ' + options.target;
        options.keypass && (command += ' -g ' + options.keypass);
        options.flags && (command += ' ' + options.flags);
        grunt.log.writeln(String(command).blue);
        shell.exec(command);

        // Delete our temporary build directory only if we created it.
        if (shouldCleanBuildPath) {
          grunt.file.delete(path.resolve(appBuildPath));
          grunt.file.delete(path.resolve(zip));
        }
        done(true);
      });
  
      // Create an archiver stream to compress individual files...
      var archive = archiver('zip');
      archive.on('error', function(err) {
        throw err;
      });
      
      // ... sent to our writable file stream.
      archive.pipe(output);
  
      // Find all the files in the source directory.
      grunt.file.recurse(appBuildPath, function(fullPath, root, subdirectory, filename){
        // Construct the path relative to the source directory.
        var relativePath = [].concat(subdirectory ? [ subdirectory, filename ] : filename).join('/');
        // Add the file.
        archive.append(fs.createReadStream(fullPath), { name: relativePath });
      });

      // Finalize the archive with a completion handler. This will close the
      // stream we have open for the .zip file.
      archive.finalize(function(err, bytes) {
        if (err) {
          throw err;
        }
      });
    } else {
      grunt.fatal('Your SDK version or platform at "' + options.sdk + '" is not supported at this time.');
    }
  });

  /* Register the 'webworks_deploy' task.
  ****************************************************************************/
  grunt.registerMultiTask('webworks_deploy', 'For BlackBerry WebWorks developers, a plugin to support deploying WebWorks apps for BlackBerry OS 10 and Tablet OS devices.', function() {
  
    var options = this.options({
    });
  
    grunt.verbose.writeflags(options, 'Options');
  
    if (!options.sdk) {
      grunt.fatal('A WebWorks SDK path is required in option "sdk".');
    }
  
    // Check that the SDK path exists.
    options.sdk = path.resolve(options.sdk);
    if (!grunt.file.exists(options.sdk)) {
      grunt.fatal('A WebWorks SDK path does not exist at "' + options.sdk + '".');
    }
    
    if (!options.ip) {
      grunt.fatal('An IP address for your BlackBerry device or simulator is required in option "ip".');
    } else if (!options.file || !grunt.file.exists(options.file)) {
      grunt.fatal('An app file (.bar, .cod, etc.) for your BlackBerry device or simulator is required in option "file".');
    }
    
    var command = undefined,
        isBlackBerry10 = sdkIsBlackBerry10(options.sdk),
        isPlayBook = sdkIsPlayBook(options.sdk);
          
    if (isBlackBerry10) {
      // i.e., /SDK/dependencies/tools/bin/blackberry-deploy -installApp -device 10.0.1.12 -package build/device/app-bb10.bar -password 9999
      command = '"' + pathWithSdk(options.sdk, deployment.bb10) + '" -installApp -device ' + options.ip + ' -package ' + options.file;
      options.password && (command += ' -password ' + options.password);
      grunt.log.writeln(String(command).blue);
      shell.exec(command);
      
    } else if (isPlayBook) {
      // i.e., /SDK/dependencies/tools/bin/blackberry-deploy -installApp -device 10.0.1.12 -package build/device/app-bb10.bar -password 9999
      command = '"' + pathWithSdk(options.sdk, deployment.playbook) + '" -installApp -device ' + options.ip + ' -package ' + options.file;
      options.password && (command += ' -password ' + options.password);
      grunt.log.writeln(String(command).blue);

      var summary = shell.exec(command);
      if(summary && summary.code >= 0) {
        // Some people coming from iOS (read: I) might not immediately get
        // that there are more icons vertically on the icon pages.
        grunt.log.writeln(String('NOTE: Look for your app by scrolling to the bottom of the icon grid.').green);
      }
    }    
  });
};
