angular
    .module('app', ['ngMaterial'])
    .config(function($mdThemingProvider){
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('red');
    });

// settings
angular.module('app').component('reactionsObjectId', {
        template: `<div layout="row">
    <div flex="initial">
     <md-input-container>
        <label>Permalink or object ID</label>
        <input ng-model="objectId" ng-init="objectId = $ctrl.objectId" ng-change="$ctrl.objectId = objectId" size="90" type="text">        
      </md-input-container>                  
    </div>
    <div  flex="initial">
        <p>
            <md-button ng-click="$ctrl.start(); $ctrl.run(objectId); $ctrl.running=true" ng-show="!$ctrl.running" ng-disabled="$ctrl.loading || !$ctrl.isOpen()">start</md-button>
            <md-button ng-click="$ctrl.stop(); $ctrl.running=false" ng-show="$ctrl.running" ng-disabled="$ctrl.loading" ng-bind="($ctrl.loading) ? 'loading...' : 'stop'"></md-button>
    </div>
</div>`,
        controller: function ($http, $timeout, Storage) {
            let loading = 0

            this.running = false

            let delay = 10000 // scraping interval

            this.isOpen = function () {
              return !!window.scene1
            }

            this.start = function () {
              localStorage.started = new Date().toISOString()

              if (Storage.sceneRef) {
                Storage.sceneRef.postMessage({
                  type: "start",
                }, location + 'scene1.html');
              }
            }

            this.run = function (objectId) {
                if ((objectId+"").indexOf(`http`) > -1) {
                  objectId = this.extractObjectId(objectId)
                }

                let since = (localStorage.started) ? localStorage.started : 0;

                loading++
                $http.get(`/api/start/${objectId}/${since}?access_token=${Storage.accessToken}`).then(()=>{
                  if (this.running) {
                    $timeout( ()=>{
                      this.run(objectId)
                    }, delay)
                  }
                }, ()=> {
                  this.running = false
                }).finally(() => {
                    loading--
                })
            }

            this.stop = () => {
              loading++
              $http.get(`/api/stop`).finally(() => {
                loading--
              });

              Storage.sceneRef.postMessage({
                type: "stop",
                percentages: {LIKE: 25, LOVE: 25.1, WOW: 25.52}
              }, location + 'scene1.html');
            }

            this.extractObjectId = function(permalink) {
              let objectId = null;

              let matches = permalink.match(/\/(\d+)/g)
              if (matches instanceof Array) {
                  objectId = matches.join(`_`).replace(/\//g,``)
              }
              console.log(`extracted ${objectId}`)

              return objectId
            }

            Object.defineProperty(this, `loading`, {
              get: () => loading > 0
            })

            Object.defineProperty(this, `objectId`, {
              get: () => localStorage.objectId,
              set: (value) => localStorage.objectId = value
            })
        }
    }
);



angular.module('app').component('x-deadline', {
        template: `
<div layout="row" layout-align="left center" layout-margin="10">
    <div flex="initial">
        Chroma key (color) 
    </div>
    <div flex="initial">        
        <input type="color" ng-model="input" ng-init="input = $ctrl.input">                
    </div>
    <div flex="initial" ng-bind="$ctrl.input"></div>
    <div flex="initial">        
        <button class="md-button" ng-click="$ctrl.apply(input)">Apply</button><br>         
    </div>
</div>
`,
        controller: function (Storage) {
            this.defaultColor = "#0f0";

            Object.defineProperty(this, `input`, {
              get: () => localStorage.bgcolor || this.defaultColor,
              set: (value) => localStorage.bgcolor = value
            })

            this.apply = function (value) {
                this.input = value
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
        template: `
                    <button class="md-button md-raised"
                     ng-class="{'md-primary': $ctrl.loggedin}"
                     ng-disabled="$ctrl.loggedin"
                     ng-click="$ctrl.fblogin()" 
                     ng-bind="$ctrl.loggedin ? 'logged in!' : 'Facebook login' "></button>
                    <button ng-click="$ctrl.open()"                           
                           class="md-button md-raised md-primary">open scene</button>
                    <span ng-bind="$ctrl.isConnected() ? 'Connected' : 'Disconnected'"></span>`,
        controller: function (Storage, $window, $scope) {
            this.open = function () {
              window.scene1 = true
                Storage.sceneRef = $window.open('scene1.html', '_blank',
                    'width=1024,height=576,location=no,status=no,menubar=no'); // note the window dimensions of the scene is modified by the scene itself
            };

            this.fblogin = () => {
              FB.getLoginStatus((response) => {
                if (response.status === 'connected') {
                  let accessToken = response.authResponse.accessToken
                  Storage.accessToken = accessToken
                  $scope.$apply(() => {
                    this.loggedin = true
                  })
                }
                else {
                  FB.login()
                }
              })
            }

            this.isConnected = function () {
                return !!Storage.sceneRef;
            }
        }
    }
);


// Storage
angular.module('app').service('Storage', Storage);
function Storage() {
  this.sceneRef = null;
}
Object.defineProperty(Storage.prototype, `accessToken`, {
  get: () => localStorage.access_token,
  set: (value) => localStorage.access_token = value
})
