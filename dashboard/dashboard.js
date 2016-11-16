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
    <div flex="initial">
     <md-input-container>
        <label>Object ID</label>
        <input ng-model="upNext" size=45 ng-init="upNext = $ctrl.upNext">        
      </md-input-container>                  
    </div>
    <div  flex="initial">
        <p>
            <md-button ng-click="$ctrl.upNext = upNext">Apply</md-button>
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
        template: `
<div layout="row" layout-align="left center" layout-margin="10">
    <div flex="initial">
        Chroma key (color) 
    </div>
    <div flex="initial">        
        <input type="color" ng-model="$ctrl.input">                
    </div>
    <div flex="initial" ng-bind="$ctrl.input"></div>
    <div flex="initial">        
        <button class="md-button" ng-click="$ctrl.apply($ctrl.input)">Apply</button><br>         
    </div>
</div>
`,
        controller: function (Storage) {
            this.defaultDate = "#0f0";
            this.input = localStorage.deadline || this.defaultDate;

            this.apply = function (value) {
                localStorage.deadline = value;
                if (value) {
                    if (Storage.sceneRef) {
                        Storage.sceneRef.postMessage({
                            type: "bgcolor",
                            color: localStorage.deadline,
                        }, location + 'scene1.html');
                    }
                    else {
                        console.warn("deadline sending: scene not open?");
                    }
                }
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