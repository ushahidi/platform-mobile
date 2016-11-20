# NetworkActivityIndicator for iOS

`Version 0.1.1`

A Plugin for Apache Cordova by [ohh2ahh](http://ohh2ahh.com).

1. [Description](https://github.com/ohh2ahh/NetworkActivityIndicator#1-description)
2. [Installation](https://github.com/ohh2ahh/NetworkActivityIndicator#2-installation)
  2. [Automatically (Command-line Interface)](https://github.com/ohh2ahh/NetworkActivityIndicator#automatically-command-line-interface)
3. [Usage](https://github.com/ohh2ahh/NetworkActivityIndicator#3-usage)
4. [License](https://github.com/ohh2ahh/NetworkActivityIndicator#4-license)

## 1. Description

This plugin allows you to show and hide the statusbar's network activity indicator on iOS. You can even start multiple instances of NetworkActivityIndicator simultaneously. The plugin hides the network activity indicator when all instances are finished.

* Ready for the Command-line Interface of Cordova / PhoneGap 3.0 and later

### Supported Platforms

* iOS

## 2. Installation

The Cordova CLI is the recommended way to install NetworkActivityIndicator, see [The Command-line Interface](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface). You can find the plugin on these registries:
* [GitHub](https://github.com/ohh2ahh/NetworkActivityIndicator)
* [npm](https://www.npmjs.com/package/cordova-plugin-networkactivityindicator)

### Automatically (Command-line Interface)

Simply run this command to add the latest version of NetworkActivityIndicator from [npm](https://www.npmjs.com/package/cordova-plugin-networkactivityindicator) to your project:
```
$ cordova plugin add cordova-plugin-networkactivityindicator
```

Don't forget to prepare and compile your project:
```
$ cordova build
```

You don't have to reference the JavaScript in your `index.html`.

Alternatively you can install NetworkActivityIndicator from [GitHub](https://github.com/ohh2ahh/NetworkActivityIndicator):
```
$ cordova plugin add https://github.com/ohh2ahh/NetworkActivityIndicator.git
```

## 3. Usage

```javascript
// Show network activity indicator
NetworkActivityIndicator.show();

// Hide network activity indicator
NetworkActivityIndicator.hide();
```

If you need/want callbacks:

```javascript
// Show network activity indicator
NetworkActivityIndicator.show(function(){
  // Success
}, function(error){
  // Error (when statusbar is hidden or indicator already shown)
});


// Hide network activity indicator
NetworkActivityIndicator.hide(function(){
  // Success
}, function(error){
  // Error (when statusbar is hidden or another instance of NetworkActivityIndicator is running)
});
```

### Full example

```javascript
// Show network activity indicator
NetworkActivityIndicator.show(function(){
  // Success
}, function(error){
  // Error (when statusbar is hidden or indicator already shown)
});


// Hide network activity indicator after 5 seconds
setTimeout(function() {
  NetworkActivityIndicator.hide(function(){
    // Success
  }, function(error){
    // Error (when statusbar is hidden or another instance of NetworkActivityIndicator is running)
  });
}, 5000);
```

## 4. License

[The MIT License (MIT)](http://www.opensource.org/licenses/mit-license.html)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.