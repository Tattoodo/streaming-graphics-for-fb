angular
    .module('app', ['ngMaterial'])
    .config(function($mdThemingProvider){
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('red');
    });

// settings
angular.module('app').component('upNext', {
        template: `<div layout="row">
    <div flex="30">
        Up next   
    </div>
    <div flex="70">
        <input ng-model="upNext" size=45 ng-init="upNext = $ctrl.upNext">   
        <button class="md-button md-raised" ng-click="$ctrl.upNext = upNext">Apply</button>
    </div>
</div>`,
        controller: function (Storage) {
            Object.defineProperty(this, 'upNext', {
                get: function () {
                    return localStorage.upNext;
                },
                set: function (value) {
                    localStorage.upNext = value;
                    if (Storage.sceneRef) {
                        Storage.sceneRef.postMessage({
                            type: "upNext",
                            text: this.upNext,
                        }, location + 'scene1.html');
                    }
                    else {
                        console.info("scene not open?");
                    }
                }
            })
        }
    }
);

angular.module('app').component('attention', {
        template: `<div layout="row">
    <div flex="30">
        Attention   
    </div>
    <div flex="70">
        <input ng-model="attention" ng-init="attention = $ctrl.attention" size="45">
        <button class="md-button md-raised" ng-click="$ctrl.attention = attention">Apply</button>
    </div>
</div>`,
        controller: function (Storage) {
            Object.defineProperty(this, 'attention', {
                get: function () {
                    return localStorage.attention;
                },
                set: function (value) {
                    localStorage.attention = value;
                    if (Storage.sceneRef) {
                        Storage.sceneRef.postMessage({
                            type: "attention",
                            text: this.attention
                        }, location + 'scene1.html');
                    }
                    else {
                        console.info("scene not open?");
                    }
                }
            })
        }
    }
);

angular.module('app').component('deadline', {
        template: `<div layout="row">
    <div flex="30">
        Deadline    
    </div>
    <div flex="70">
        <input type="text" ng-model="deadline" ng-init="deadline = $ctrl.deadline" size="45">
        <button class="md-button md-raised" ng-click="$ctrl.deadline = deadline">Apply</button><br>
        <code>2016-04-10T14:00:00.0200</code>    
    </div>
</div>`,
        controller: function (Storage) {
            const defaultDate = "2016-04-10T14:00:00.0200";

            Object.defineProperty(this, 'deadline', {
                get: function () {
                    return localStorage.deadline;
                },
                set: function (value) {
                    localStorage.deadline = value;

                    var dateObj = new Date(value);
                    if (!isNaN(dateObj.getTime())) {
                        if (Storage.sceneRef) {
                            Storage.sceneRef.postMessage({
                                type: "deadline",
                                date: dateObj,
                            }, location + 'scene1.html');
                        }
                        else {
                            console.info("deadline sending: scene not open?");
                        }
                    }
                }
            })
        }
    }
);

angular.module('app').component('pause', {
        template: `<div layout="row">
    <div flex="30">
           
    </div>
    <div flex="70">
        <input ng-model="$ctrl.pause" type="checkbox"> Show pause screen (eg. "We'll be back..")    
    </div>
</div>`,
        controller: function (Storage) {
            Object.defineProperty(this, 'pause', {
                get: function () {
                    return (localStorage.pause == 1);
                },
                set: function (value) {
                    localStorage.pause = (value == 1) ? '1' : '';
                    if (Storage.sceneRef) {
                        Storage.sceneRef.postMessage({
                            type: "pause",
                            pause: !!value
                        }, location + 'scene1.html');
                    }
                    else {
                        console.info("window not open. pause");
                    }
                }
            });

            if (angular.isUndefined(localStorage.pause)) {
                this.pause = 1; // set default value (of the scene) in localStorage
            }
        }
    }
);



// open scene button
angular.module('app').component('openScene', {
        template: `<button ng-click="$ctrl.open()"                           
                           class="md-button md-raised md-primary">open scene</button>
                    <span ng-bind="$ctrl.isConnected() ? 'Connected' : 'Disconnected'"></span>`,
        controller: function (Storage, $window) {
            this.open = function () {
                Storage.sceneRef = $window.open('scene1.html', '_blank',
                    'width=1024,height=576,location=no,status=no,menubar=no'); // note the window dimensions of the scene is modified by the scene itself
            };

            this.isConnected = function () {
                return !!Storage.sceneRef;
            }
        }
    }
);

// Storage
angular.module('app').service('Storage', function () {

        function Storage() {
            this.sceneRef = null;
        }


        return Storage;
    }
);