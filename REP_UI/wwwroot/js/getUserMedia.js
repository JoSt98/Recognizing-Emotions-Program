
(function (window, document) {
    "use strict";

    window.getUserMedia = function (options, successCallback, errorCallback) {

        // Options are required
        if (options !== undefined) {

            // getUserMedia() feature detection
            navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

            if ( !! navigator.getUserMedia_) {
                // constructing a getUserMedia config-object and 
                // an string (we will try both)
                var option_object = {};
                var option_string = '';

                option_object.video = true;
                option_string = 'video';
                options.context = 'webrtc';

                // first we try if getUserMedia supports the config object
                try {
                    // try object
                    navigator.mediaDevices.getUserMedia_(option_object, successCallback, errorCallback);
                } catch (e) {
                    // option object fails
                    try {
                        // try string syntax
                        // if the config object failes, we try a config string
                        navigator.mediaDevices.getUserMedia_(option_string, successCallback, errorCallback);
                    } catch (e2) {
                        // both failed
                        // neither object nor string works
                        return undefined;
                    }
                }
            } else {

                // Act as a plain getUserMedia shield if no fallback is required
                if (options.noFallback === undefined || options.noFallback === false) {

                    // Fallback to flash
                    var cam;

                    (function register(run) {

                        cam = document.getElementById('XwebcamXobjectX');

                        if (cam.capture !== undefined) {

                            // Simple callback methods are not allowed 
                            options.capture = function (x) {
                                try {
                                    return cam.capture(x);
                                } catch (e) {}
                            };
                            options.save = function (x) {
                                try {
                                    return cam.save(x);
                                } catch (e) {

                                }
                            };
                            options.setCamera = function (x) {
                                try {
                                    return cam.setCamera(x);
                                } catch (e) {}
                            };
                            options.getCameraList = function () {
                                try {
                                    return cam.getCameraList();
                                } catch (e) {}
                            };

                            // options.onLoad();
                            options.context = 'flash';
                            options.onLoad = successCallback;

                        } else if (run === 0) {
                            // Flash movie not yet registered
                            errorCallback();
                        } else {
                            // Flash interface not ready yet 
                            window.setTimeout(register, 1000 * (4 - run), run - 1);
                        }
                    }(3));

                }

            }
        }
    };

}(this, document));
