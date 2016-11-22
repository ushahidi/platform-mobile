cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-fabric-plugin.FabricPlugin",
        "file": "plugins/cordova-fabric-plugin/www/FabricPlugin.js",
        "pluginId": "cordova-fabric-plugin",
        "clobbers": [
            "window.fabric.core"
        ]
    },
    {
        "id": "cordova-fabric-plugin.FabricAnswersPlugin",
        "file": "plugins/cordova-fabric-plugin/www/FabricPlugin.Answers.js",
        "pluginId": "cordova-fabric-plugin",
        "clobbers": [
            "window.fabric.Answers"
        ]
    },
    {
        "id": "cordova-fabric-plugin.FabricCrashlyticsPlugin",
        "file": "plugins/cordova-fabric-plugin/www/FabricPlugin.Crashlytics.js",
        "pluginId": "cordova-fabric-plugin",
        "clobbers": [
            "window.fabric.Crashlytics"
        ]
    },
    {
        "id": "cordova-plugin-app-version.AppVersionPlugin",
        "file": "plugins/cordova-plugin-app-version/www/AppVersionPlugin.js",
        "pluginId": "cordova-plugin-app-version",
        "clobbers": [
            "cordova.getAppVersion"
        ]
    },
    {
        "id": "cordova-plugin-console.console",
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "console"
        ]
    },
    {
        "id": "cordova-plugin-console.logger",
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "id": "cordova-plugin-device.device",
        "file": "plugins/cordova-plugin-device/www/device.js",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "id": "cordova-plugin-email.EmailComposer",
        "file": "plugins/cordova-plugin-email/www/email_composer.js",
        "pluginId": "cordova-plugin-email",
        "clobbers": [
            "cordova.plugins.email",
            "plugin.email"
        ]
    },
    {
        "id": "cordova-plugin-google-analytics.UniversalAnalytics",
        "file": "plugins/cordova-plugin-google-analytics/www/analytics.js",
        "pluginId": "cordova-plugin-google-analytics",
        "clobbers": [
            "analytics",
            "ga"
        ]
    },
    {
        "id": "cordova-plugin-networkactivityindicator.NetworkActivityIndicator",
        "file": "plugins/cordova-plugin-networkactivityindicator/www/NetworkActivityIndicator.js",
        "pluginId": "cordova-plugin-networkactivityindicator",
        "clobbers": [
            "NetworkActivityIndicator"
        ]
    },
    {
        "id": "cordova-plugin-spinner-dialog.SpinnerDialog",
        "file": "plugins/cordova-plugin-spinner-dialog/www/spinner.js",
        "pluginId": "cordova-plugin-spinner-dialog",
        "merges": [
            "window.plugins.spinnerDialog"
        ]
    },
    {
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "id": "cordova-plugin-statusbar.statusbar",
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "id": "cordova-plugin-x-socialsharing.SocialSharing",
        "file": "plugins/cordova-plugin-x-socialsharing/www/SocialSharing.js",
        "pluginId": "cordova-plugin-x-socialsharing",
        "clobbers": [
            "window.plugins.socialsharing"
        ]
    },
    {
        "id": "cordova-sqlite-storage.SQLitePlugin",
        "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
        "pluginId": "cordova-sqlite-storage",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "id": "ionic-plugin-deeplinks.deeplink",
        "file": "plugins/ionic-plugin-deeplinks/www/deeplink.js",
        "pluginId": "ionic-plugin-deeplinks",
        "clobbers": [
            "IonicDeeplink"
        ],
        "runs": true
    },
    {
        "id": "ionic-plugin-keyboard.keyboard",
        "file": "plugins/ionic-plugin-keyboard/www/ios/keyboard.js",
        "pluginId": "ionic-plugin-keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "id": "cordova-plugin-secure-storage.SecureStorage",
        "file": "plugins/cordova-plugin-secure-storage/www/securestorage.js",
        "pluginId": "cordova-plugin-secure-storage",
        "clobbers": [
            "SecureStorage"
        ]
    },
    {
        "id": "cordova-plugin-secure-storage.sjcl_ss",
        "file": "plugins/cordova-plugin-secure-storage/www/sjcl_ss.js",
        "pluginId": "cordova-plugin-secure-storage",
        "runs": true
    },
    {
        "id": "cordova-plugin-nativestorage.mainHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/mainHandle.js",
        "pluginId": "cordova-plugin-nativestorage",
        "clobbers": [
            "NativeStorage"
        ]
    },
    {
        "id": "cordova-plugin-nativestorage.LocalStorageHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/LocalStorageHandle.js",
        "pluginId": "cordova-plugin-nativestorage"
    },
    {
        "id": "cordova-plugin-nativestorage.NativeStorageError",
        "file": "plugins/cordova-plugin-nativestorage/www/NativeStorageError.js",
        "pluginId": "cordova-plugin-nativestorage"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-fabric-plugin": "1.1.1",
    "cordova-plugin-app-version": "0.1.9",
    "cordova-plugin-console": "1.0.4",
    "cordova-plugin-device": "1.1.3",
    "cordova-plugin-email": "1.2.2",
    "cordova-plugin-google-analytics": "1.7.1",
    "cordova-plugin-ios-longpress-fix": "1.1.0",
    "cordova-plugin-networkactivityindicator": "0.1.1",
    "cordova-plugin-spinner-dialog": "1.3.1",
    "cordova-plugin-splashscreen": "4.0.0",
    "cordova-plugin-statusbar": "2.2.0",
    "cordova-plugin-whitelist": "1.3.0",
    "cordova-plugin-x-socialsharing": "5.1.3",
    "cordova-sqlite-storage": "1.4.8",
    "ionic-plugin-deeplinks": "1.0.8",
    "ionic-plugin-keyboard": "2.2.1",
    "cordova-plugin-secure-storage": "2.6.3",
    "cordova-plugin-nativestorage": "2.0.2"
};
// BOTTOM OF METADATA
});