(function () {
    'use strict';

    var App = {

        init: function () {

            var myContext;
            // Test ob GetUserMedia unterstützt wird, oder Flash verwendet werden muß
            if (this.hasGetUserMedia() === true) {
                //GetUserMedia
                document.getElementById('FlashCam').style.display = 'none';
                document.getElementById('XwebcamXobjectX').data = '';
                var constraints = { audio: false, video: { width: 320, height: 240 } };
                navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
                    var video = document.getElementById('YwebcamYobjectY');
                    video.srcObject = mediaStream;
                    video.onloadedmetadata = function (e) {
                        video.play();
                    };
                })
                    .catch(function (err) { console.log(err.name + ": " + err.message); });
                myContext = 'webrtc';
            }
            else {
                //Flash
                document.getElementById('WebCam').style.display = 'none';
                myContext = 'flash';
            }

            if (!!this.options) {
                this.pos = 0;
                this.cam = null;
                this.filter_on = false;
                this.filter_id = 0;
                this.canvas = document.getElementById("Preview");
                this.ctx = this.canvas.getContext("2d");
                this.img = new Image();
                this.ctx.clearRect(0, 0, this.options.width, this.options.height);
                this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height);
                this.snapshotBtn = document.getElementById('takeSnapshot');
                this.analyzeFaceBtn = document.getElementById('analyzeFace');
                this.addEvent('click', this.analyzeFaceBtn, this.analyzeFace);
                this.addEvent('click', this.snapshotBtn, this.getSnapshot);
                this.context = myContext;
                window.webcam = this.options;

                getUserMedia(this.options, this.success, this.deviceError);

            }
            else alert('Es wurden keine Optionen geliefert!');
            
        },

        //Event eines Elemente einer Function zuordnen
        addEvent: function (type, obj, fn) {
            if (obj.attachEvent) {
                obj['e' + type + fn] = fn;
                obj[type + fn] = function () {
                    obj['e' + type + fn](window.event);
                }
                obj.attachEvent('on' + type, obj[type + fn]);
            } else {
                obj.addEventListener(type, fn, false);
            }
        },

        options: {

            width: 320,
            height: 240,
            quality: 95,
            context: "",

            onCapture: function () {
                window.webcam.save();
            },

            onSave: function (data) {
                var col = data.split(";"),
                    img = App.image,
                    tmp = null,
                    w = this.width,
                    h = this.height;

                for (var i = 0; i < w; i++) {
                    tmp = parseInt(col[i], 10);
                    img.data[App.pos + 0] = (tmp >> 16) & 0xff;
                    img.data[App.pos + 1] = (tmp >> 8) & 0xff;
                    img.data[App.pos + 2] = tmp & 0xff;
                    img.data[App.pos + 3] = 0xff;
                    App.pos += 4;
                }

                if (App.pos >= 4 * w * h) {
                    App.ctx.putImageData(img, 0, 0);
                    App.pos = 0;
                }

            },

        },

        success: function (stream) {

            if (App.options.context === 'webrtc') {

                var video = getElementById('YwebcamYobjectY');

                if ((typeof MediaStream !== "undefined" && MediaStream !== null) && stream instanceof MediaStream) {

                    if (video.mozSrcObject !== undefined) { //FF18a
                        video.mozSrcObject = stream;
                    } else { //FF16a, 17a
                        video.src = stream;
                    }

                    return video.play();

                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                }

                video.onerror = function () {
                    stream.stop();
                    streamError();
                };

            } else {
                // flash context
            }

        },


        deviceError: function (error) {
            alert('Keine Kamera gefunden.');
            if (!!error) console.error('Es ist ein Fehler aufgetreten: [CODE ' + error.code + ']');
        },

        changeFilter: function () {
            if (this.filter_on) {
                this.filter_id = (this.filter_id + 1) & 7;
            }
        },

        //wenn der Snapshot-Button gedrückt wurde
        getSnapshot: function () {
            document.getElementById("analyzeFace").disabled = false;
            
            if (App.options.context === 'webrtc') {

                var video = document.getElementById('YwebcamYobjectY');
                App.canvas.width = video.videoWidth;
                App.canvas.height = video.videoHeight;
                App.canvas.getContext('2d').drawImage(video, 0, 0);


            } else if (App.options.context === 'flash') {

                window.webcam.capture();
                App.changeFilter();
            }
            else {
                alert('Es wurde kein Kontext bereitgestellt...');
            }
        },

        //Testfunktion ob getUserMedia unterstützt wird
        hasGetUserMedia: function () {
            return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        },

        // wenn der Analyse-Button gedrückt wurde
        analyzeFace: function () {
            document.getElementById('responseMessage').innerHTML = "Bildanalyse läuft...";

            var data = "";
            var img = App.canvas.toDataURL("image/png");

            // sending img.DataURL -> webservice
            var request = new XMLHttpRequest();

            request.open('Post', 'http://localhost:60125/api/REP/REP_Analyze', true);
            request.setRequestHeader('Content-type', 'application/json');

            request.onload = function () {
                // Rückgabeverarbeitung
                if (this.status === 200) {
                    var myResponseText = this.responseText.toString()
                    var responseData = myResponseText.substring(myResponseText.indexOf("<div>"), myResponseText.lastIndexOf("</div>") + 6)
                    document.getElementById('responseMessage').innerHTML = responseData;
                }
                else document.getElementById('responseMessage').innerHTML = "<div>" + this.responseText + "<br />Fehler: " + this.statusText + "</div>";
            }

            request.send(img);

        }

    };

App.init();

})();
