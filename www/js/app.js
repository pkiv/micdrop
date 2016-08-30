// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('micdrop', ['ionic', 'micdrop.controllers'])

.run(function($ionicPlatform, showFactory, settingsFactory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    /*if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }*/
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    showFactory.get(settingsFactory.getDistance());
  });
})


.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    cache: false,
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.maps', {
      url: '/map',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })
  .state('app.map', {
      url: '/map/:showId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })
  .state('app.settings', {
    url: '/settings',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })
    .state('app.shows', {
      url: '/shows',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/shows.html',
          controller: 'ShowsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/shows/:showId',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/show.html',
        controller: 'ShowCtrl'
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/shows');
});
