// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','ionic-audio'])

  .run(function($ionicPlatform,$rootScope,$state,$ionicPopup,$cordovaFileTransfer,Proxy,
                $cordovaMedia,$interval,$http,$cordovaPreferences,$q) {

    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins&&window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      $rootScope.candidates={};

      $rootScope.flags={
        serviceOrders:{
          onFresh:true,
          clear:false,
          data:{}
        }
      }

      $rootScope.times={
      }

      $rootScope.timers={
      }

      $rootScope.$on('ACK_AUTH', function(event, args) {
        if($rootScope.timers.serviceOrders!==undefined&&$rootScope.timers.serviceOrders!==null)
        {

        }
        else{
          var timer=function () {
            $rootScope.flags.serviceOrders.onFresh=true;
            console.log('data refresh timer.....');
          }
          $rootScope.timers.serviceOrders=$interval(timer,120000);
        }
      });

      //用户注销时删除计时
      $rootScope.$on('ACK_QUIT',function (event,args) {
        if($rootScope.timers.serviceOrders!==undefined&&$rootScope.timers.serviceOrders!==null)
          $interval.cancel($rootScope.timers.serviceOrders);
      })

      //计时器取消
      $rootScope.$on("$destroy",function () {
        if($rootScope.timers.serviceOrders!==undefined&&$rootScope.timers.serviceOrders!==null)
          $interval.cancel($rootScope.timers.serviceOrders);
      });

      window.plugins.jPushPlugin.init();
      window.plugins.jPushPlugin.setDebugMode(true);


      $rootScope.getAccessToken=function () {
        var deferred=$q.defer();
        if($rootScope.access_token!==undefined&&$rootScope.access_token!==null)
        {
          alert('xxx');
          deferred.resolve({re: 1, data: $rootScope.access_token});
        }else {
          $cordovaPreferences.fetch('username')
            .success(function (value) {
              var user={};
              if (value !== undefined && value !== null && value != '')
                user.username = value;
              $cordovaPreferences.fetch('password')
                .success(function (value) {
                  if (value !== undefined && value !== null && value != '')
                    user.password = value;
                  if (user.username !== undefined && user.username !== null && user.username != ''
                    && user.password !== undefined && user.password !== null && user.password != '') {
                    $http({
                      method: "POST",
                      data: "grant_type=password&password=" + user.password + "&username=" + user.username,
                      url: Proxy.local() + '/login',
                      headers: {
                        'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                        'Content-Type': 'application/x-www-form-urlencoded'
                      }
                    }).then(function (res) {
                      var json = res.data;
                      var access_token = json.access_token;
                      $rootScope.access_token = access_token;
                      deferred.resolve({re: 1, data: access_token});
                    });
                  }else{
                    deferred.resolve({re: 2, data: '请登录app后查看推送通知'});
                  }
                });
            });

        }
        return deferred.promise;
      }

      $rootScope.onReceiveNotification=function (event) {

        try{
          alert('$rootScope.onReceiveNotification');
          var extras=null;

          if(device.platform == "Android") {
            extras=event.extras;
          }else{
            return ;
          }

          if(Object.prototype.toString.call(extras)=='[object String]')
            extras=JSON.parse(extras);
          alert('type='+extras.type);


          switch (extras.type) {
            case 'orderHasBeenTaken':
                var orderId=extras.orderId;
                var date=new Date(extras.date);
                $rootScope.getAccessToken().then(function (json) {
                  if(json.re==1) {
                    $http({
                      method: "post",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                        'Authorization': "Bearer " + $rootScope.access_token,
                      },
                      data: {
                        request: 'createNotification',
                        info:{
                          ownerId:orderId,
                          content:'订单号为'+extras.orderNum+'的订单已成功接单',
                          notyTime:date,
                          recv:'service',
                          subType:null,
                          type:'service',
                          servicePersonId:$rootScope.user.servicePersonId

                        }
                      }
                    }).then(function (res) {
                      var json=res.data;
                      if (json.re == 1) {
                      }

                      return  $http({
                        method: "post",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                          'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data: {
                          request: 'getCarServiceOrderByOrderId',
                          info:{
                            orderId:orderId
                          }
                        }
                      });
                    }).then(function (res) {
                      var json=res.data;
                      var order=json.data;
                      var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: '订单号为'+extras.orderNum+'的订单已成功接单'
                      });
                      confirmPopup.then(function(res) {
                        if(res) {
                          //TODO:进入相应订单详情页
                          $state.go('orderDetail',{order:JSON.stringify({content:order})});
                        } else {}
                      });
                      $rootScope.flags.serviceOrders.onFresh=true;
                    })
                  }
                }).catch(function (err) {
                  alert(err);
                })

              break;

            case 'agreeWithCandidate':
              var orderId=extras.orderId;
              var date=new Date(extras.date);
              $rootScope.getAccessToken().then(function (json) {
                if(json.re==1) {
                  $http({
                    method: "post",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token,
                    },
                    data: {
                      request: 'createNotification',
                      info:{
                        ownerId:orderId,
                        content:'订单号为'+extras.orderNum+'的订单已成功接单',
                        notyTime:date,
                        recv:'service',
                        subType:null,
                        type:'service',
                        servicePersonId:$rootScope.user.servicePersonId

                      }
                    }
                  }).then(function (res) {
                    var json=res.data;
                    if(json.re==1) {

                    }
                    return $http({
                      method: "POST",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                      },
                      data: {
                        request: 'getCarServiceOrderByOrderId',
                        info: {
                          orderId:orderId
                        }
                      }
                    });
                  }).then(function (res) {
                    var json=res.data;
                    if(json.data!==undefined&&json.data!==null)
                    {
                      var order=json.data;
                      var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: '订单号为'+order.orderNum+'的订单已成功接单'
                      });
                      confirmPopup.then(function(res) {
                        if(res) {
                          //TODO:进入相应订单详情页
                          $state.go('orderDetail',{order:JSON.stringify({content:order})});
                        } else {}
                      });
                      $rootScope.flags.serviceOrders.onFresh=true;
                    }
                  }).catch(function (err) {
                    var str='';
                    for(var field in err)
                      str+=err[field];
                    console.error('err=\r\n'+str);
                  })


                }
              })

              break;

            case 'customer_appoint':
              //用户直接指定服务人员
              alert('customer_appoint');
              var orderId=extras.orderId;
              var content='您被系统指派了订单，订单号为'+extras.orderNum;
              var date=new Date(extras.date);
              var fileSystem=null;
              $rootScope.getAccessToken().then(function (json) {
                alert('json.re='+json.re);
                if(json.re==1) {
                  $http({
                    method: "post",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token,
                    },
                    data: {
                      request: 'createNotification',
                      info:{
                        ownerId:orderId,
                        content:content,
                        notyTime:date,
                        recv:'service',
                        subType:null,
                        type:'service',
                        servicePersonId:$rootScope.user.servicePersonId
                      }
                    }
                  }).then(function (res) {
                    var json=res.data;
                    if(json.re==1)
                    {

                    }
                    return $http({
                      method: "POST",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                      },
                      data: {
                        request: 'getCarServiceOrderByOrderId',
                        info: {
                          orderId:orderId
                        }
                      }
                    });
                  }).then(function (res) {
                    var json=res.data;
                    if(json.re==1&&json.data!==undefined&&json.data!==null) {
                      var order=json.data;
                      var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: content
                      });
                      confirmPopup.then(function(res) {
                        if(res) {
                          //TODO:进入相应订单详情页
                          $state.go('orderDetail',{order:JSON.stringify({content:order})});
                        } else {}
                      });
                      $rootScope.flags.serviceOrders.onFresh=true;
                      var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                        content+'&ttsToken='+$rootScope.ttsToken;
                      fileSystem=cordova.file.externalApplicationStorageDirectory;
                      var target=fileSystem+'temp.mp3';
                      var trustHosts = true;
                      var options = {
                        fileKey: 'file',
                        headers: {
                          'Authorization': "Bearer " + $rootScope.access_token
                        }
                      };
                      $cordovaFileTransfer.download(url, target, options, trustHosts)
                        .then(function (res) {
                          //TODO:播放录音

                          var filepath=fileSystem+'temp.mp3';
                          filepath = filepath.replace('file://','');
                          var media = $cordovaMedia.newMedia(filepath);

                          if(ionic.Platform.isIOS()) {
                          }else if(ionic.Platform.isAndroid()) {
                            media.play();
                          }else{}
                          console.log('tts speach generate success');
                        }, function (err) {
                          console.log('err=========================');
                          var str='';
                          for(var field in err)
                            str+=field+':'+'\r\n'+err[field];
                          console.log('error=' + str);
                        }, function (progress) {

                        });
                    }
                  })
                }
              })

              break;



          }
        }catch(err)
        {
          alert('exception=\r\n' + err.toString());
        }
      }


      //获取自定义消息的回调
      $rootScope.onReceiveMessage = function(event) {

        try{

          var message=null;
          if(device.platform == "Android") {
            message = event.message;
          } else {
            message = event.content;
          }
          if(Object.prototype.toString.call(message)!='[object Object]')
          {
            message = JSON.parse(message);
          }else{}

          //TODO:message classify
          switch(message.type)
          {
            case 'orderHasBeenTaken':

              var confirmPopup = $ionicPopup.confirm({
                title: '信息',
                template: '订单号为'+message.order.orderNum+'的订单已成功接单'
              });
              confirmPopup.then(function(res) {
                if(res) {
                  //TODO:进入相应订单详情页
                  $state.go('orderDetail',{order:JSON.stringify({content:message.order})});
                } else {}
              });
              $rootScope.flags.serviceOrders.onFresh=true;
              break;
            case 'customer_appoint':
              //用户直接指定服务人员
              var content='您被系统指派了订单，订单号为'+message.order.orderNum;

              var confirmPopup = $ionicPopup.confirm({
                title: '信息',
                template: content
              });
              confirmPopup.then(function(res) {
                if(res) {
                  //TODO:进入相应订单详情页
                  $state.go('orderDetail',{order:JSON.stringify({content:message.order})});
                } else {}
              });
              $rootScope.flags.serviceOrders.onFresh=true;
              var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                content+'&ttsToken='+$rootScope.ttsToken;
              fileSystem=cordova.file.externalApplicationStorageDirectory;
              var target=fileSystem+'temp.mp3';
              var trustHosts = true;
              var options = {
                fileKey: 'file',
                headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
                }
              };
              $cordovaFileTransfer.download(url, target, options, trustHosts)
                .then(function (res) {
                  //TODO:播放录音

                  var filepath=fileSystem+'temp.mp3';
                  filepath = filepath.replace('file://','');
                  var media = $cordovaMedia.newMedia(filepath);

                  if(ionic.Platform.isIOS()) {
                  }else if(ionic.Platform.isAndroid()) {
                    media.play();
                  }else{}
                  console.log('tts speach generate success');
                }, function (err) {
                  console.log('err=========================');
                  var str='';
                  for(var field in err)
                    str+=field+':'+'\r\n'+err[field];
                  console.log('error=' + str);
                }, function (progress) {

                });
              break;
            case 'orderCancel':
              var orderId=message.orderId;
              $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                  request: 'getCarServiceOrderByOrderId',
                  info: {
                    orderId:orderId
                  }
                }
              }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                  var order=json.data;
                  $rootScope.flags.serviceOrders.onFresh=true;
                  $rootScope.$emit('ORDER_CANCEL', '订单号为'+order.orderNum+'的用户取消服务,是否现在立即刷新界面');

                  var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                    '订单号为'+order.orderNum+'的用户取消服务'+'&ttsToken='+$rootScope.ttsToken;
                  fileSystem=cordova.file.externalApplicationStorageDirectory;
                  alert('fileSystem=\r\n' + fileSystem);
                  var target=fileSystem+'temp.mp3';
                  var trustHosts = true;
                  var options = {
                    fileKey: 'file',
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                    }
                  };
                  $cordovaFileTransfer.download(url, target, options, trustHosts)
                    .then(function (res) {
                      //TODO:播放录音

                      var filepath=fileSystem+'temp.mp3';
                      filepath = filepath.replace('file://','');
                      var media = $cordovaMedia.newMedia(filepath);

                      if(ionic.Platform.isIOS()) {
                      }else if(ionic.Platform.isAndroid()) {
                        media.play();
                      }else{}
                      console.log('tts speach generate success');
                    }, function (err) {
                      console.log('err=========================');
                      var str='';
                      for(var field in err)
                        str+=field+':'+'\r\n'+err[field];
                      console.log('error=' + str);
                    }, function (progress) {

                    });
                }
              })
              break;
            case 'agreeWithCandidate':
              var orderId=message.orderId;
              $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                  request: 'getCarServiceOrderByOrderId',
                  info: {
                   orderId:orderId
                  }
                }
              }).then(function (res) {
                var json=res.data;
                if(json.data!==undefined&&json.data!==null)
                {
                  var order=json.data;
                  var confirmPopup = $ionicPopup.confirm({
                    title: '信息',
                    template: '订单号为'+order.orderNum+'的订单已成功接单'
                  });
                  confirmPopup.then(function(res) {
                    if(res) {
                      //TODO:进入相应订单详情页
                      $state.go('orderDetail',{order:JSON.stringify({content:order})});
                    } else {}
                  });
                  $rootScope.flags.serviceOrders.onFresh=true;
                }
              }).catch(function (err) {
                var str='';
                for(var field in err)
                  str+=err[field];
                console.error('err=\r\n'+str);
              })
              break;
            case 'orderFinish':

              var orderId=message.orderId;
              $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                  request: 'getCarServiceOrderByOrderId',
                  info: {
                    orderId:orderId
                  }
                }
              }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                  var order=json.data;
                  $rootScope.flags.serviceOrders.onFresh=true;
                  $rootScope.$emit('ORDER_FINISH', '订单号为'+order.orderNum+'的订单已被用户确认为完成,是否现在立即刷新界面');

                  var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                  '订单号为'+order.orderNum+'的订单已被用户确认为完成'+'&ttsToken='+$rootScope.ttsToken;
                  fileSystem=cordova.file.externalApplicationStorageDirectory;
                  alert('fileSystem=\r\n' + fileSystem);
                  var target=fileSystem+'temp.mp3';
                  var trustHosts = true;
                  var options = {
                    fileKey: 'file',
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                    }
                  };
                  $cordovaFileTransfer.download(url, target, options, trustHosts)
                    .then(function (res) {
                      //TODO:播放录音

                      var filepath=fileSystem+'temp.mp3';
                      filepath = filepath.replace('file://','');
                      var media = $cordovaMedia.newMedia(filepath);

                      if(ionic.Platform.isIOS()) {
                      }else if(ionic.Platform.isAndroid()) {
                        media.play();
                      }else{}
                      console.log('tts speach generate success');
                    }, function (err) {
                      console.log('err=========================');
                      var str='';
                      for(var field in err)
                        str+=field+':'+'\r\n'+err[field];
                      console.log('error=' + str);
                    }, function (progress) {

                    });
                }
              })
              break;
            default:

              //语音播报,区分订单状态2和订单状态1的
              var fileSystem=null;
              if (ionic.Platform.isIOS()) {
                //IOS平台
              }else if(ionic.Platform.isAndroid())
              {

                //订单状态为'1'的推送消息
                var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                  '您有一个服务订单可以接单,订单号为'+message.order.orderNum+'&ttsToken='+$rootScope.ttsToken;
                fileSystem=cordova.file.externalApplicationStorageDirectory;
                alert('fileSystem=\r\n' + fileSystem);
                var target=fileSystem+'temp.mp3';
                var trustHosts = true;
                var options = {
                  fileKey: 'file',
                  headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                  }
                };
                $cordovaFileTransfer.download(url, target, options, trustHosts)
                  .then(function (res) {
                    //TODO:播放录音

                    var filepath=fileSystem+'temp.mp3';
                    filepath = filepath.replace('file://','');
                    var media = $cordovaMedia.newMedia(filepath);

                    if(ionic.Platform.isIOS()) {
                    }else if(ionic.Platform.isAndroid()) {
                      media.play();
                    }else{}
                    console.log('tts speach generate success');
                  }, function (err) {
                    console.log('err=========================');
                    var str='';
                    for(var field in err)
                      str+=field+':'+'\r\n'+err[field];
                    console.log('error=' + str);
                  }, function (progress) {

                  });

              }else{
              }


              $rootScope.flags.serviceOrders.onFresh=true;
              var confirmPopup = $ionicPopup.confirm({
                title: '新订单:'+message.order.orderNum,
                template: '是否查看'
              });
              confirmPopup.then(function(res) {
                if(res) {
                  //TODO:进入相应订单详情页
                  //message里就是存的order
                  $rootScope.candidates[message.order.orderId] = {timeout: 0};
                  //设置为侯选状态
                  message.order.candidateState=1;
                  $state.go('orderDetail',{order:JSON.stringify({content:message.order})});
                } else {}
              });
              break;
          }
        }catch(e){
          alert('exception=\r\n' + e.toString());
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

      var onGetRegistradionID = function(data) {
        try{
          alert('go waiting....');
          $rootScope.registrationId=data;
          alert('registrationId=\r\n' + data);
        }catch(exception){
          alert('error=\r\n' + exception.toString());
        }
      };

      $rootScope.onGetRegistradionId=function(data) {
        try{
          $rootScope.registrationId=data;
          alert('registrationId=\r\n' + data);
        }catch(exception){
          alert('error=\r\n' + exception.toString());
        }
      };

      window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
      window.plugins.jPushPlugin.setTags(['custom']);
      document.addEventListener("jpush.receiveMessage", $rootScope.onReceiveMessage, false);
      document.addEventListener("jpush.receiveNotification", $rootScope.onReceiveNotification, false);
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
        cache:false,
        url:'/dashboard/:action',
        views:{
          'dashboard-tab':{
            controller:'dashboardController',
            templateUrl:'views/dashboard/dashboard.html'
          }
        }
      })

      .state('newDashboard',{
        cache:false,
        url:'/newDashboard',
        controller:'newDashboardController',
        templateUrl:'views/newDashboard/newDashboard.html'
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
        cache:'false',
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

      .state('ordersDone',{
        url:'/ordersDone',
        controller:'orderDoneController',
        templateUrl:'views/ordersDone/ordersDone.html'
      })

      .state('orderDone_detail',{
        url:'/orderDone_detail:order',
        controller:'orderDoneDetailController',
        templateUrl:'views/orderDone_detail/orderDone_detail.html'
      })


      .state('my_wallet',{
        url:'/my_wallet',
        controller:'myWalletController',
        templateUrl:'views/my_wallet/my_wallet.html'
      })


      .state('password_modify',{
        url:'/password_modify',
        controller:'passwordModifyController',
        templateUrl:'views/password_modify/password_modify.html'
      })

      .state('password_forget',{
        url:'/password_forget',
        controller:'passwordForgetController',
        templateUrl:'views/password_forget/password_forget.html'
      })


    $urlRouterProvider.otherwise('/login');
  })


  .directive('textareaAuto', function ($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        console.log(element[0].nodeName)
        if("TEXTAREA"==element[0].nodeName&&attr.textareaAuto){
          //自适应高度
          //$(element).autoTextarea()
        }
      }
    };
  })

  .factory('Proxy', function() {
    var ob={
      local:function(){
        if(window.cordova!==undefined&&window.cordova!==null)
          return "http://192.168.1.114:3000";
        else
          return "/proxy/node_server";
      },
      insurancems:function () {
        if(window.cordova!==undefined&&window.cordova!==null)
        {
          return "http://139.129.96.231";
        }else{
          return "/proxy/insurancems";
        }
      }
    }
    return ob;
  })


  .factory('$WebSocket',function(){
    var self=this;

    self.cbs=[];

    self.msgId=1;

    self.getMsgId=function()
    {
      return self.msgId++;
    }

    self.connect=function(cb){
      self.ws = new window.WebSocket('ws://139.129.96.231:3010');
      self.ws.onopen=self.onopen;
      self.ws.onmessage=self.onmessage;
    }
    self.onopen=function(message) {
      console.log('websocket connection is established');
      self.cbs.map(function(item,i) {
        item(message);
      });
    }
    self.onerr=function(err) {
      console.log('connect error');
    }
    self.onclose=function(event) {
      console.log('websocket shutdown from server' + event.code);
    }
    self.onmessage=function(event) {
      var json=event.data;
      if(Object.prototype.toString.call(json)=='[object String]')
        json=JSON.parse(json);
      switch (json.type) {
        case 'ack':
          console.log(json.msg);
          break;
        case 'notify':
          console.log('msg come from '+json.from);
          console.log('msg ='+json.msg);
          break;
        default:
          break;
      }
    }
    self.login=function (username,password,accessToken) {
      var info= {
        action:'login',
        msgid: self.getMsgId(),
        timems:new Date().getTime(),
        username:username,
        password:password
      };
      if(Object.prototype.toString.call(info)!='[object String')
        info=JSON.stringify(info);
      self.ws.send(info);
    }
    self.send=function(msg) {
      var info=msg;
      if(Object.prototype.toString.call(info)!='[object String')
        info=JSON.stringify(info);
      self.ws.send(info);
    }
    self.registeCallback=function(cb) {
      var flag=false;
      self.cbs.map(function(item,i) {
        if(item==cb)
          flag=true;
      })
      if(!flag)
        self.cbs.push(cb);
    };
    self.unregisteCallback=function(cb) {
      self.cbs.map(function(item,i) {
        if(item==cb)
          self.cbs.slice(i, 1);
      })
    };
    return self;
  })

