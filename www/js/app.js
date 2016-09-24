// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  })

    .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

      $ionicConfigProvider.platform.ios.tabs.style('standard');
      $ionicConfigProvider.platform.ios.tabs.position('bottom');
      $ionicConfigProvider.platform.android.tabs.style('standard');
      $ionicConfigProvider.platform.android.tabs.position('standard');

      $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
      $ionicConfigProvider.platform.android.navBar.alignTitle('left');

      $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
      $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

      $ionicConfigProvider.platform.ios.views.transition('ios');
      $ionicConfigProvider.platform.android.views.transition('android');

      $stateProvider

        .state('tabs',{
          url:'/tabs',
          abstract:true,
          templateUrl:'views/tabs/tabs.html'
        })

        .state('login',{
          url:'/login',
          controller: 'loginController',
          templateUrl:'views/login/login.html'
        })

        .state('tabs.dashboard',{
          url:'/dashboard',
          views:{
            'dashboard-tab':{
              controller:'dashboardController',
              templateUrl:'views/dashboard/dashboard.html'
            }
          }
        })

        .state('tabs.myInfo',{
          url:'/myInfo',
          views:{
            'myInfo-tab':{
              controller:'myInfoController',
              templateUrl:'views/my_info/my_info.html'
            }
          }
        })

        .state('tabs.servicing',{
          url:'/servicing',
          views:{
            'servicing-tab':{
              controller:'servicingController',
              templateUrl:'views/servicing/servicing.html'
            }
          }
        })

        .state('register',{
          url:'/register',
          controller:'registerController',
          templateUrl:'views/register/register.html'
        })

        .state('orderDetail',{
          url:'/orderDetail',
          controller:'orderDetailController',
          templateUrl:'views/order_detail/order_detail.html'
        })

        .state('photo',{
          url:'/photo/:photoType',
          controller:'photoController',
          templateUrl:'views/photo/photo.html'
        })



      $urlRouterProvider.otherwise('/login');
    })



