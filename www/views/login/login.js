/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('loginController',function($scope,$state,$ionicLoading,$http,$rootScope,Proxy){

    $scope.user={};




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
        alert('access_token=' + access_token);
      }).error(function(err) {
        alert('error=\r\n' + err.toString());
      })
    }

    $scope.onGetRegistradionID = function(data) {
      try{
        alert('go waiting....');
        $rootScope.registrationId=data;
        alert('registrationId=\r\n' + data);
        $scope.login();
      }catch(exception){
        alert('error=\r\n' + exception.toString());
      }
    };

    $scope.login=function(){

      $http({
        method:"POST",
        data:"grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
        url:Proxy.local()+"/login",
        url:"http://192.168.1.106:3000/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function(res) {
        var json=res.data;
        $rootScope.access_token=json.access_token;
        if(json.access_token!==undefined&&json.access_token!==null)
        {
          return   $http({
            method: "post",
            url: Proxy.local()+"/svr/request",
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
      }).then(function(json) {
        $state.go('tabs.dashboard');
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
        window.plugins.jPushPlugin.getRegistrationID($scope.onGetRegistradionID);
        document.addEventListener("jpush.receiveMessage", $rootScope.onReceiveMessage, false);
      }else{
        $scope.login();
      }




    }




    //登录
    $scope.login_backup = function(){

      $http({
        method:"POST",
        data:"grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
        url:"http://192.168.1.106:3000/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function(response){
        alert('request is back');
        $rootScope.access_token=response.data.access_token;
        alert('access_token=\r\n' + response.data.access_token);
        return   $http({
          method: "post",
          url: "/proxy/node_server/svr/request",
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
      }).then(function(res) {
        var json=res.data;
        if(json.re==1)
        {

        }
        $state.go('register');
      }).catch(function(err){
        var error='';
        alert('error=' + err.toString());
      });

    }

    $scope.searchFreeServicePerson=function(){
      $http({
        method:"POST",
        url: "/proxy/node_server/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data:
        {
          request:'searchFreeServicePerson'
        }
      }).then(function(res) {

      }).catch(function(err) {
        var str='';
        for(var field in err)
          str+=err[field];
        alert('err=\r\n' + str);
      });
    }


  });


