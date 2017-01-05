/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('loginController',function($scope,$state,$ionicLoading,
                                         $http,$rootScope,Proxy,$cordovaPreferences,
                                         $ionicPlatform,$cordovaFile,
                                         $ionicPopup){

    $scope.user={};


    $scope.myTrack = {
      url: 'https://www.example.com/my_song.mp3',
      artist: 'Somebody',
      title: 'Song name',
      art: 'img/person.jpg'
    }



    $scope.tt=function(){
      $http({
        method:"POST",
        data:"grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
        url:"http://202.194.14.106:3000/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(res) {
        var access_token=res.access_token;
        console.log('access_token=' + access_token);
      }).error(function(err) {
        alert('error=\r\n' + err.toString());
      })
    }

    $scope.login=function(){

      $http({
        method:"POST",
        data:"grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
        url:Proxy.local()+"/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function(res) {
        var json=res.data;
        $rootScope.access_token=json.access_token;
        $rootScope.$emit('ACK_AUTH', 'ack successfully');
        console.log('access_token=\r\n' + $rootScope.access_token);

        if(json.access_token!==undefined&&json.access_token!==null)
        {
          if(window.cordova)
          {
            $cordovaPreferences.store('username', $scope.user.username)
              .success(function(value) {
              })
              .error(function(error) {
                alert("Error: " + error);
              });
            $cordovaPreferences.store('password', $scope.user.password)
              .success(function(value) {
              })
              .error(function(error) {
                alert("Error: " + error);
              });
          }else{
            //浏览器环境
            window.localStorage.user=JSON.stringify($scope.user);
          }

          return   $http({
            method: "post",
            url:Proxy.local()+"/svr/request",
            headers: {
              'Authorization': "Bearer " + $rootScope.access_token,
            },
            data:
            {
              request:'activatePersonOnline',
              info:{
                registrationId:$rootScope.registrationId
              }
            }
          });
        }
      }).then(function(res) {
        var json=res.data;
        return $http({
                method: "post",
                url: Proxy.local() + "/svr/request",
                headers: {
                  'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                  request: 'getTTSToken'
                }
              });

      }).then(function(res) {
        var json=res.data;
        if(json.re==1) {
          var ttsToken=json.data;
          if(ttsToken!==null&&ttsToken!==undefined)
          {
            $rootScope.ttsToken=ttsToken;
          }
        }
        $state.go('newDashboard');
      }).catch(function(err) {

        var msg=err.data;
        if(msg.error=='invalid_grant')
        {
          if(msg.error_description=='User credentials are invalid')
          {

            $http({
              method: "POST",
              url: Proxy.local() + "/validateUser?username="+$scope.user.username+'&'+'password='+$scope.user.password,
              headers: {
                'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(function (res) {
              var json=res.data;
              if(json.re==2)
              {
                $ionicPopup.alert({
                  title: '错误',
                  template: json.data
                });
              }else if(json.re==-1)
              {
                $ionicPopup.alert({
                  title: '错误',
                  template: '用户名不存在'
                });
              }else{}
            })
          }
        }else{
          var str='';
          for(var field in err)
            str+=err[field];
          alert('error=' + str);
        }
      });
    }

    $scope.doLogin=function(){

      if($rootScope.registrationId==undefined||$rootScope.registrationId==null||$rootScope.registrationId=='')
      {

        if(window.cordova!==undefined&&window.cordova!==null)
        {
          try{
            window.plugins.jPushPlugin.getRegistrationID(function(data) {
              alert('registrationId=\r\n'+data);
              $rootScope.registrationId=data;
              $scope.login();
            });
          }catch(e)
          {
            alert(e);
          }

        }
        else
          $scope.login();

      }else{
          $scope.login();
      }


    }


    $scope.fetch=function () {
      $cordovaPreferences.fetch('username')
        .success(function(value) {
          if(value!==undefined&&value!==null&&value!='')
            $scope.user.username=value;

          $cordovaPreferences.fetch('password')
            .success(function(value) {
              if(value!==undefined&&value!==null&&value!='')
                $scope.user.password=value;

            })
            .error(function(error) {
              alert("Error: " + error);
            });
        })
        .error(function(error) {
          alert("Error: " + error);
        });
    }



    //自动获取用户名和密码
    if(window.cordova)
    {
      $ionicPlatform.ready (function () {



        //删出danding.wav文件
        if(ionic.Platform.isAndroid())
        {
          $cordovaFile.removeFile(cordova.file.externalRootDirectory, "danding.wav")
            .then(function (success) {
              alert('success=' + success);
            }, function (error) {
              // error
              alert('err=' + error);
            });
        }


        $scope.fetch();
      })
    }else{
      //浏览器环境
      if(window.localStorage.user!==undefined&&window.localStorage.user!==null)
      {
        var user=window.localStorage.user;
        if(Object.prototype.toString.call(user)=='[object String]')
          user=JSON.parse(user);
        if(user!==undefined&&user!==null)
          $scope.user=user;
      }
    }

    $scope.makePhone=function (phone) {
      window.PhoneCaller.call(phone,function () {
      }, function () {
        console.log('phone call encoutner error');
      });
    }

  });


