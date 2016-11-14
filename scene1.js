resizeViewPort(1024, 576);
window.addEventListener("message", function receiveMessage(event) {
    if (event.data && event.data.type === "resize") {
        resizeViewPort(event.data.x, event.data.y);
    }
}, false);

angular
    .module('app', ['ngMaterial'])
    .config(function($mdThemingProvider, $compileProvider){
        $mdThemingProvider.theme('default')
            .primaryPalette('teal')
            .accentPalette('orange');

        $compileProvider.debugInfoEnabled(false);
    });

angular.module('app').component('upNext', {
        template: `<span class="__upnext-text"></span>`,
        controller: function () {
            this.$onInit = function () {
                window.addEventListener("message", receiveMessage, false);
            };

            function receiveMessage(event) {
                if (event.data && event.data.type === "upNext") {
                    document.querySelector(".__upnext-text").innerHTML = event.data.text;    
                }
            }

            this.text = "";
        }
    }
);

angular.module('app').component('deadline', {
        template: `<span class="__deadline-time _bold"></span>`,
        controller: function () {
            const updateMS = 1000;
            var deadline = new Date("2016-04-10T14:00:00.0200"); // danish local time
            var handle;
            var elem;

            this.$onInit = function () {
                elem = document.querySelector(".__deadline-time");
                onInterval();
                handle = setInterval(onInterval, updateMS);

                window.addEventListener("message", receiveMessage, false);
            };

            function receiveMessage(event) {
                if (event.data && event.data.type === "deadline") {
                    deadline = event.data.date;
                }
            }

            this.$onDestroy = function () {
                clearInterval(handle);
            };

            function onInterval() {
                const text = formatHoursMinutesSeconds(new Date(), deadline);
                elem.innerHTML = text;
            }

            function formatHoursMinutesSeconds(t0, t1) {
                var dur = moment.duration().add( t1 - t0, "millisecond");
                if (t1 > t0) {
                    var hours = Math.floor(dur.asHours());
                    if (hours < 10) {
                        hours = '0' + hours.toString();
                    }
                    var minutes = dur.minutes();
                    if (minutes < 10) {
                        minutes = '0' + minutes.toString();
                    }
                    var seconds = dur.seconds();
                    if (seconds < 10) {
                        seconds = '0' + seconds.toString();
                    }
                    return hours + ":" + minutes + ":" + seconds;
                }
                else {
                    return "00:00:00";
                }
            }
        }
    }
);

angular.module('app').component('sponsors', {
        template: `<div layout="row" layout-fill style="padding: 1rem 2rem;">
                        <div class="__sponsors" flex="" style="                   
                            background: transparent url(sponsors/IGDADKBanner.png) center center no-repeat;
                            background-size: contain;
                        "></div>
                    </div>`,
        controller: function () {
            const updateMS = 20000;
            var handle;
            var elem;
            const images = [
                'sponsors/IGDADKBanner.png',
                'sponsors/AAU_Line_Blue.png',
                'sponsors/Google_Cast_Logo.png',
                'sponsors/UE4BlackOutlineTransparent-931x1024.png',
                'sponsors/DanskeSpil.png',
                'sponsors/unity-logo.png',
                'sponsors/NordicGame2016.png',
            ];
            var index = Math.floor(Math.random() * images.length);

            this.$onInit = function () {
                elem = document.querySelector(".__sponsors");
                onInterval();
                handle = setInterval(onInterval, updateMS);
            };

            this.$onDestroy = function () {
                clearInterval(handle);
            };

            function onInterval() {
                if (index >= images.length) {
                    index = 0;
                }
                elem.style.backgroundImage = `url("${images[index]}")`;
                index += 1;
            }
        }
    }
);

angular.module('app').component('attention', {
        template: `<span class="__attention text"></span>`,
        controller: function () {
            this.$onInit = function () {
                window.addEventListener("message", receiveMessage, false);
            };
            function receiveMessage(event) {
                if (event.data.type === "attention") {
                    var text = event.data.text;
                    var elem = document.querySelector(".__attention");
                    elem.innerHTML = text;
                }
            }

        }
    }
);

angular.module('app').component('pause', {
        template: `
            <div ng-show="$ctrl.pause" class="pause-box">
                <div style="height: 100%" layout="row" layout-align="center center">
                    <div flex="none" class="_bold">
                        <span class="pause-heading">We will return shortly...</span>                 
                    </div>
                </div>
            </div>
        `,
        controller: function ($scope) {
            this.pause = true;
            var self = this;
            this.$onInit = function () {
                window.addEventListener("message", receiveMessage, false);
            };
            function receiveMessage(event) {
                if (event.data.type === "pause") {
                    $scope.$apply(function () {
                        self.pause = !!event.data.pause;
                    });
                }
            }

        }
    }
);

angular.module('app').component('twitter', {
        template: `
<div>
    <strong ng-bind="$ctrl.tweet.username"></strong>
    <span ng-bind="$ctrl.tweet.text"></span>
</div>
        `,
        controller: function ($http, $interval) {
            var self = this;
            this.tweet = {};
            var hashtag = 'ngj16';
            const timeout = 10000;
            var tweetList = [];

            this.$onInit = function () {
                window.addEventListener("message", receiveMessage, false);
                self.fetch().then(next);
                $interval(next, timeout);
            };

            function next() {
                if (tweetList.length <= 1) {
                    self.fetch();
                }
                if (tweetList.length > 0) {
                    self.tweet = tweetList.shift();
                }
                else {
                    self.tweet = {};
                }
            }

            this.fetch = function () {
                return $http.get('/twitter/'+hashtag).then(function (response) {
                    if (angular.isObject(response.data)) {
                        angular.forEach(response.data.statuses, function (item) {
                            var tweet = {
                                text: item.text,
                                username: item.user.name,
                            };
                            tweetList.push(tweet);
                        });
                        // tweetList.sort(function(a, b) {
                        //     return +(a.id > b.id) || +(a.id === b.id) - 1;
                        // });
                        // tweetList.reverse();
                    }
                });
            };

            function receiveMessage(event) {
                if (event.data.type === "twitter") {
                    hashtag = event.data.hashtag;
                    self.fetch().then(next);
                }
            }

        }
    }
);


function resizeViewPort(width, height) {
    window.resizeTo(
        width + (window.outerWidth - window.innerWidth),
        height + (window.outerHeight - window.innerHeight)
    );
}