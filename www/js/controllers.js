angular.module('micdrop.controllers', ['ngCordova','ngMap'])

.controller('AppCtrl', function($scope, musicFactory, showFactory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.musicFactory = musicFactory;
  $scope.shows = showFactory.shows;

})

.controller('ShowsCtrl', function($scope, showFactory, musicFactory, settingsFactory) {
  $scope.shows = showFactory.shows;
  $scope.musicFactory = musicFactory;
})

.controller('ShowCtrl', function($scope, $stateParams, showFactory, $filter) {
  $scope.show = $filter('getById')(showFactory.shows, $stateParams.showId);
})

.controller('SettingsCtrl', function($scope, $stateParams, settingsFactory, $state) {
  $scope.settingsFactory = settingsFactory;
  $scope.distance = settingsFactory.getDistance();

  $scope.setDistance = function(distance) {
    settingsFactory.setDistance(distance);
    $state.go('app.map'); 
  };
})

.controller('MapCtrl', function($scope, showFactory, locationFactory, NgMap, $stateParams, $filter, settingsFactory) {
  $scope.shows = showFactory.shows;
  $scope.show = $scope.shows[0];
  $scope.distance = settingsFactory.getDistance() * 1000;

  NgMap.getMap("zmap").then(function(map) {
    $scope.map = map;
  });

  $scope.$on('$ionicView.enter', function(e) {
    if ($stateParams.showId != null){
        NgMap.getMap("zmap").then(function(map) {
          var show = $filter('getById')($scope.shows, $stateParams.showId);
          map.panTo(new google.maps.LatLng(show.location.coordinates[1], show.location.coordinates[0]));
          map.showInfoWindow('info', show._id);
        });
    }
  });

  locationFactory.get().then(function(position){
      $scope.currentlocation = [position.lat, position.lng];
  });

  $scope.showDetail = function(e, show) {
    $scope.show = show;
    $scope.map.showInfoWindow('info', show._id);
  };

  $scope.hideDetail = function() {
      $scope.map.hideInfoWindow('info');
  };

  $scope.controlClick = function () {
    $scope.map.panTo(new google.maps.LatLng($scope.currentlocation[0], $scope.currentlocation[1]));   
  };

})


.controller('MusicCtrl', function($scope, musicFactory, showFactory) {
  $scope.musicFactory = musicFactory;
  $scope.shows = showFactory.shows;


  $scope.$watch('musicFactory.playing', function(){
    $scope.playingText = musicFactory.playing ? 'Pause' : 'Play';
    $scope.playingIcon = musicFactory.playing ? 'ion-pause' : 'ion-play';
  })
})

.factory('locationFactory', function($cordovaGeolocation, $q){
  var currentLoc = {};
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  var get = function(){
    return $q(function(resolve, reject) {
      if (Object.keys(currentLoc).length > 0) {
        resolve(currentLoc);
      } else {
        $cordovaGeolocation.getCurrentPosition(posOptions)
        .then(function(position) {
            console.log("Found geolocation");
            currentLoc.lat  = position.coords.latitude;
            currentLoc.lng = position.coords.longitude;
            resolve(currentLoc)
          }, function(err) {
            console.log("error");
            console.log(err);
            reject("location error");
          });
      }
    });
  }
  return {
        get:    get
    };  
})

.factory('showFactory',function($http, locationFactory){
  var showObj = {};
  showObj.shows = [];

  showObj.get = function(distance){
    if (showObj.shows.length > 0) {
      showObj.shows = []
    }
    console.log("Called show load");
    locationFactory.get()
    .then(function(position){
      $http.get("http://micdrop.audio/shows?lat="+ position.lat + "&lng="+ position.lng +"&dist="+ (distance * 1000)) 
        .then(function(response){ 
         console.log("got data");
         for (var i in response.data) {
           console.log(response.data[i]);
           showObj.shows.push(response.data[i]);
         }
       });
    });
  };

  return showObj;
})

.factory('musicFactory',function(showFactory){
  var musicObj = {};
  musicObj.shows = showFactory.shows;
  musicObj.currentTrack;
  musicObj.playing = false;
  musicObj.audio = new Audio();

  musicObj.getStatus = function() {
    return musicObj.playing;
  }

  musicObj.getCurrentTrack = function() {
    return musicObj.currentTrack;
  }

  musicObj.audio.onended = function() {
      if (musicObj.currentTrack < musicObj.shows.length - 1) {
        musicObj.currentTrack++;
        musicObj.playTrack(musicObj.currentTrack);
      }
      else {
        alert("Out of songs!");
      }
  };

  musicObj.togglePlay = function() {
      if (musicObj.audio.currentSrc == "" && musicObj.shows.length > 0) {
        musicObj.playTrack(0);
        musicObj.currentTrack = 0;
      } else if (musicObj.audio.paused && musicObj.shows.length > 0) {
        musicObj.audio.play();
        musicObj.playing = true;
      } else {
        musicObj.audio.pause();
        musicObj.playing = false;
      }
    };

  musicObj.skip = function() {
      console.log(musicObj.currentTrack);
      if (musicObj.currentTrack < musicObj.shows.length - 1) {
          musicObj.currentTrack++;
          musicObj.playTrack(musicObj.currentTrack);
      } else {
        musicObj.currentTrack = 0;
        musicObj.playTrack(musicObj.currentTrack);
      }
    };

    musicObj.back = function() {
      if (musicObj.audio.currentTime < 5 && musicObj.currentTrack != 0){
        musicObj.currentTrack--;
        musicObj.playTrack(musicObj.currentTrack);
      } else if (musicObj.audio.currentTime < 5 && musicObj.currentTrack == 0) {
        musicObj.currentTrack = musicObj.shows.length - 1;
        musicObj.playTrack(musicObj.currentTrack);
      } else {
        musicObj.audio.pause();
        musicObj.audio.currentTime = 0;
        musicObj.audio.play();
        musicObj.playing = true;
      }
    };

    musicObj.playSongs = function() {
      musicObj.playTrack(musicObj.shows[musicObj.currentTrack]);
    };

    musicObj.playTrack = function(index) {
      track = musicObj.shows[index];
      console.log(track);
      musicObj.currentTrack = index;
      console.log("Currently playing track " + musicObj.currentTrack);
      musicObj.playing = true;
      musicObj.audio.src = "http://micdrop.audio" + track.song; //10.0.0.237:3000
      musicObj.audio.play();
    };

  return musicObj;
})

.factory('settingsFactory',function(showFactory){
  var settingsObj = {};

  settingsObj.getDistance = function() {
    if(window.localStorage.getItem("distance") == null) {
        return 20;
    } else {
        return window.localStorage.getItem("distance");
    }
  }

  settingsObj.setDistance = function(distance) {
    window.localStorage.setItem("distance", distance);
    showFactory.get(distance);
  }

  return settingsObj;
})

.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i]._id == id) {
        return input[i];
      }
    }
    return null;
  }
});