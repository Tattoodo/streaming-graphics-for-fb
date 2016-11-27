

angular
  .module('app', [ 'ngMaterial' ])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('red')
  })

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
  controller: function ($http, $timeout, Storage, Scene) {
    let loading = 0

    this.running = false

    let delay = 10000 // scraping interval

    this.isOpen = function () {
      return Scene.sceneRef !== null
    }

    this.start = function () {
      Storage.started = new Date().toISOString()

      Scene.postMessage(`start`)
    }

    this.run = function (objectId) {
      if ((objectId + ``).indexOf(`http`) > -1) {
        objectId = this.extractObjectId(objectId)
      }

      let since = (Storage.started) ? Storage.started : 0

      loading++
      $http.get(`/api/start/${objectId}/${since}?access_token=${Storage.accessToken}`).then(() => {
        if (this.running) {
          $timeout(() => {
            this.run(objectId)
          }, delay)
        }
      }, () => {
        this.running = false
      }).finally(() => {
        loading--
      })
    }

    this.stop = () => {
      loading++
      $http.get(`/api/stop`).finally(() => {
        loading--
      })

      Scene.postMessage(`stop`, {
        percentages: { LIKE: 25, LOVE: 25.1, WOW: 25.52 }
      })
    }

    this.extractObjectId = function (permalink) {
      let objectId = null

      let matches = permalink.match(/\/(\d+)/g)
      if (matches instanceof Array) {
        objectId = matches.join(`_`).replace(/\//g, ``)
      }
      console.log(`extracted ${objectId}`)

      return objectId
    }

    Object.defineProperty(this, `loading`, {
      get: () => loading > 0
    })

    Object.defineProperty(this, `objectId`, {
      get: () => localStorage.objectId,
      set: (value) => {
        localStorage.objectId = value
      }
    })
  }
})

// settings
angular.module('app').component('selectReactions', {
  template: `
<h4>Reactions</h4>
<div  class="md-padding">
  <div layout="row" layout-wrap>
    <div flex="100" layout="column">
        <div layout="row" layout-wrap flex>
            <div class="demo-select-all-checkboxes" flex="100" ng-repeat="item in items">
              <md-checkbox ng-checked="exists(item, selected)" ng-click="toggle(item, selected)">
               {{ item }}
              </md-checkbox>
            </div>
        </div>
      </div>  
  </div>
  <md-button ng-click="apply()">apply</md-button>
</div>

`,
  controller: function ($scope, $http, Storage) {

    let allReactions = [ Reaction.LIKE, Reaction.LOVE, Reaction.HAHA, Reaction.WOW, Reaction.SAD, Reaction.ANGRY ]
    console.log(allReactions)

    $scope.items = allReactions
    let saved = Storage.reactions
    $scope.selected = saved || allReactions.slice(0, 2)

    $scope.toggle = function (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) {
        list.splice(idx, 1);
      }
      else {
        list.push(item);
      }
    };

    $scope.apply = function () {
      $http.put(`/api/reaction_types/${$scope.selected.join(`,`)}`, ``).then(function (response) {
        $scope.selected = response.data
        Storage.reactions = response.data // validated
      }, console.error);
    }

    $scope.exists = function (item, list) {
      return list.indexOf(item) > -1;
    };

    $scope.isChecked = function () {
      return $scope.selected.length === $scope.items.length;
    };

    $scope.apply()

  }


})

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
  controller: function (Scene, Storage, $scope) {
    this.open = function () {
      Scene.open()
    }

    this.fblogin = () => {
      FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
          let accessToken = response.authResponse.accessToken
          Storage.accessToken = accessToken
          $scope.$apply(() => {
            this.loggedin = true
          })
        } else {
          FB.login()
        }
      })
    }

    this.isConnected = function () {
      return !!Scene.sceneRef
    }
  }
})

// Storage
angular.module('app').service('Storage', class Storage {
  get accessToken () {
    return localStorage.access_token
  }

  set accessToken (value) {
    localStorage.access_token = value
  }

  get reactions () {
    return this.getJSON(`reactions`)
  }

  set reactions (value) {
    this.setJSON(`reactions`, value)
  }

  get started () {
    return localStorage.started
  }

  set started (value) {
    localStorage.started = value
  }

  setJSON (key, value) {
    let json = (value && typeof value === `object`) ? JSON.stringify(value) : false
    if (json) {
      localStorage[key] = json
    }
  }

  getJSON (key) {
    let json = localStorage[key]
    let parsed = null
    if (json) {
      try {
        parsed = JSON.parse(json)
      }
      catch (e) {
        console.error(e)
      }
    }

    return parsed
  }
})

class Scene {
  constructor ($window, $location) {
    this.target = $location.absUrl() + 'scene1.html'

    this.open = () => {
      this.sceneRef = $window.open(this.target, '_blank', 'width=1024,height=576,location=no,status=no,menubar=no')
    }
  }

  get sceneRef () {
    return this._sceneRef || null
  }

  set sceneRef (value) {
    this._sceneRef = value
  }

  postMessage (type, data) {
    this._sceneRef.postMessage(new Scene.Message(type, data), this.target)
  }
}
Scene.Message = class {
  constructor (type, data) {
    this.type = type
    this.data = data
  }
}
angular.module('app').service('Scene', Scene)
