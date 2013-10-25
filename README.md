# grunt-webworks-developer

> For BlackBerry WebWorks developers, a plugin to support packaging and deploying WebWorks apps for BlackBerry 10 and Tablet OS devices.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-webworks-developer --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-webworks-developer');
```

## The "webworks_package" task

### Overview
In your project's Gruntfile, add a section named `webworks_package` and/or `webworks_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  webworks_package: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        // Target-specific options go here.
      }
    }
  }
})
```

### Options

#### options.sdk
Type: `String`

The path for the SDK. The script will detect which platform (BlackBerry 10, PlayBook) is being used when generating the packaged apps.

#### options.src
Type: `Array`
Default value: `[]`

An array for storing the source directories. The directories will be copied into the same temporary location prior to building so that overrides can be used as needed for different targets. Example: `src: [ 'www' ]`.

#### options.target
Type: `String`
Default value: `'.'`

The target directory used for the build and packaging process.

#### options.name
Type: `String`
Default value: `'app'`

The name for the app for use when creating the final app package.

## The "webworks_deploy" task

### Overview
In your project's Gruntfile, add a section named `webworks_package` and/or `webworks_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  webworks_deploy: {
    your_target: {
      options: {
        // Target-specific options go here.
      }
    },
  }
})
```

### Options

#### options.sdk
Type: `String`

The path for the SDK. The script will detect which platform (BlackBerry 10, PlayBook) is being used when generating the packaged apps.

#### options.file
Type: `String`

The relative path to the .bar file to deploy.

#### options.ip
Type: `String`

The IP address of the device.

#### options.password
Type: `String`

The password for the device. (This is the same as the unlock code/unlock password.)

### Usage Examples

#### Default Options
In this example, the default options are used to take the contents of the 'facebook' and 'facebook_extras' directory (the samples are included in the plugin contents under `node_modules/grunt-webworks-developer`) and create two .bar files: `facebookbb10.bar` in the `build` directory for BlackBerry 10 and `facebookplaybook.bar` for the BlackBerry PlayBook.

 The `webworks_deploy` section deploys each file to the local IP address of each device.

```js
grunt.initConfig({
  webworks_package: {
    options: {
      src: [ 'facebook', 'facebook_extras' ],
      target: 'build',
      keypass: 'YOURKEYSTOREPASSWORD',
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
  webworks_deploy: {
    facebook_bb10: {
      options: {
        sdk: '/Developer/WebWorksBB10',
        file: 'build/device/facebookbb10.bar',
        ip: 'IP_ADDRESS_OF_BB10_DEVICE',
        password: 'YOUR_DEVICE_UNLOCK_PASSWORD'
      }
    },
    facebook_playbook: {
      options: {
        sdk: '/Developer/WebWorksTabletOS',
        file: 'build/facebookplaybook.bar',
        ip: 'IP_ADDRESS_OF_PLAYBOOK',
        password: 'YOUR_DEVICE_UNLOCK_PASSWORD'
      }
    },
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
