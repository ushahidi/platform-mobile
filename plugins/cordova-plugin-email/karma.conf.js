module.exports = function(config) {
    // Example set of mobile platforms to run on Cordova
    config.set({
        // The rest of your karma config is here
        // ...
        cordovaSettings: {
            platforms: ['android', 'ios'],
            mode: 'emulate',
            hostip: '127.0.0.1',
            target: '',
            plugins: [
                'cordova-plugin-device',
                'cordova-plugin-console',
                '.'
            ]
        },
        browsers: ['Cordova'],
        reporters: ['dots', 'progress'],
        singleRun: true
    });
};