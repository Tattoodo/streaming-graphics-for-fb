let types = [ Reaction.LIKE, Reaction.LOVE, Reaction.HAHA ]

// resizeViewPort(1024, 576);

if (localStorage.color) {
    // setBackground(localStorage.color)
}

function setBackground(color) {
    localStorage.color = color;
    var e = document.createElement(`style`)
    e.innerHTML = `        
        html,body {
            background: ${color};
        }        
    `
    document.head.appendChild(e);
}

window.addEventListener("message", function receiveMessage(event) {
    if (event.data && event.data.type === "bgcolor") {
        setBackground(event.data.color)
    }
}, false);


window.addEventListener("message", function receiveMessage(event) {
    if (event.data && event.data.type === "resize") {
        resizeViewPort(event.data.x, event.data.y);
    }
}, false);

angular
    .module('app', ['ngMaterial','countTo'])
    .config(function ($mdThemingProvider, $compileProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('teal')
            .accentPalette('orange');

        $compileProvider.debugInfoEnabled(false);
    });

angular.module('app').component('cell', {
    bindings: {
        number: "<",
        reaction: "@",
        pulsate: "<",
    },
    controller: function ($element) {
        // let el = null;
        // let greenClass =  'green-fade';
        // let redClass =  'red-fade';
        //
        // this.$postLink = function () {
        //     el = $element.find('animated-text');
        // }

        this.$onChanges = function (changes) {
            if (changes.number) {
                this.prevValue = changes.number.previousValue;
                this.number = changes.number.currentValue;

                // if (el) {
                //     setTimeout(()=> {
                //         this.applyColours()
                //     },10);
                // }

            }
        }

        // this.applyColours = function () {
        //     el.removeClass(greenClass)
        //     el.removeClass(redClass)
        //
        //     if (this.number < this.prevValue) {
        //         el.addClass(redClass)
        //     }
        //     else if (this.number >= this.prevValue) {
        //         el.addClass(greenClass)
        //     }
        //     else {
        //         console.warn(this.number, this.prevValue, this.number === this.prevValue)
        //     }
        // }

    },
    template: `
<div layout="row" layout-align="center end" layout-fill>
    <div class="cell__number" 
         ng-class="{'animation-pulsate': $ctrl.pulsate}">
        <div class="reaction ">
            <div class="reaction__sprite reaction__sprite--{{::$ctrl.reaction}}"></div>
        </div>         
        <animated-text 
              count-to="{{$ctrl.number}}"                            
              value="{{$ctrl.prevValue}}"
              filter="number"
              filter-param-1="1"             
              duration="0.75">
        </animated-text> %
    </div>
</div>
`
})

angular.module('app').component('percentages', {
        template: `
    <div layout="row" style="height: 100%;">
        <cell layout="column" flex number="$ctrl.LIKE" reaction="like" class="cell" pulsate="$ctrl.isBiggest('LIKE')"></cell>
        <cell layout="column" flex number="$ctrl.LOVE" reaction="love" class="cell" pulsate="$ctrl.isBiggest('LOVE')"></cell>
        <cell layout="column" flex number="$ctrl.HAHA" reaction="haha" class="cell" pulsate="$ctrl.isBiggest('HAHA')"></cell>
    </div>        
`,
        controller: function ($scope, $http, $timeout) {

            this.isBiggest = function (name) {
              let sum = types.reduce((key, currentValue) => {
                return ((this[key] !== undefined) ? this[key] : 0) + this[currentValue]
              }, 0)
              if (sum === 0) {
                return false
              }
              else {
                let biggestValueKey = types.reduce((bestKey, currentValue) => {
                  return (!bestKey || this[bestKey] > this[currentValue]) ? bestKey : currentValue
                })
                return (biggestValueKey === name)
              }
            }

          this.$onInit = function () {
            this.update()
          }

          this.update = () => {
            $http.get("/api/percentages").then((result) => {
              if (!window.stopped) {
                let data = result.data.percentages
                types.forEach((key)=>{
                  this[key] = data[key]
                })
              }
            })
            .finally(()=>{
              $timeout(this.update, 1000)
            })
          }

          window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "stop") {
              window.stopped = true;
            }
          }, false);

          window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "start") {
              window.stopped = false;
              console.log(`resumed...`)
            }
          }, false);
        }
    }
);

function resizeViewPort(width, height) {
    window.resizeTo(
        width + (window.outerWidth - window.innerWidth),
        height + (window.outerHeight - window.innerHeight)
    );
}


document.body.addEventListener("click", (event) => {
  toggleFullScreen()
}, false);

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}
