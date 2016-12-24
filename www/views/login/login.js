/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('loginController',function($scope,$state,$ionicLoading,
                                         $http,$rootScope,Proxy,$cordovaPreferences,
                                         $ionicPlatform){

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
        var str='';
        for(var field in err)
          str+=err[field];
        alert('error=' + str);
      });
    }

    $scope.doLogin=function(){

      if($rootScope.registrationId==undefined||$rootScope.registrationId==null||$rootScope.registrationId=='')
      {
        $scope.login();
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
        $scope.fetch();
      })
    }

    $scope.makePhone=function (phone) {
      window.PhoneCaller.call(phone,function () {
      }, function () {
        console.log('phone call encoutner error');
      });
    }

  });


