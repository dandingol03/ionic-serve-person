// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])

  .run(function($ionicPlatform,$rootScope) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins&&window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      alert('init before');
      window.plugins.jPushPlugin.init();
      window.plugins.jPushPlugin.setDebugMode(true);

      //获取自定义消息的回调
      $rootScope.onReceiveMessage = function(event) {
        try{
          var message=null;
          alert('go into');
          alert('message=' + event.message);
          if(device.platform == "Android") {
            message = event.message;
          } else {
            message = event.content;
          }
          alert('message=' + message);
        } catch(exception) {
          alert("JPushPlugin:onReceiveMessage-->" + exception);
        }
      }

      var onTagsWithAlias = function(event) {
        try {
          console.log("onTagsWithAlias");
          var result = "result code:" + event.resultCode + " ";
          result += "tags:" + event.tags + " ";
          result += "alias:" + event.alias + " ";
          alert('result=\r\n' + result);
        } catch(exception) {
          console.log(exception);
        }
      }

      //f9bb743849fe5fbe67ea6d81


      window.plugins.jPushPlugin.setTags(['custom']);
      alert('init end');
      document.addEventListener("jpush.setTagsWithAlias", onTagsWithAlias, false);


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

      .state('tabs.chatter',{
        url:'/chatter',
        views:{
          'chatter-tab':{
            controller:'chatterController',
            templateUrl:'views/chatter/chatter.html'
          }
        }
      })

      .state('register',{
        url:'/register',
        controller:'registerController',
        templateUrl:'views/register/register.html'
      })

      .state('orderDetail',{
        url:'/orderDetail/:order',
        controller:'orderDetailController',
        templateUrl:'views/order_detail/order_detail.html'
      })

      .state('photo',{
        url:'/photo/:photoType',
        controller:'photoController',
        templateUrl:'views/photo/photo.html'
      })

      .state('chatter',{
        url:'/chatter',
        controller:'chatterController',
        templateUrl:'views/chatter/chatter.html'
      })


    $urlRouterProvider.otherwise('/login');
  })




  .directive('textareaAuto', function ($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        console.log(element[0].nodeName)
        //判断是否是    TEXTAREA
        if("TEXTAREA"==element[0].nodeName&&attr.textareaAuto){
          //自适应高度
          //$(element).autoTextarea()
        }
      }
    };
  })

