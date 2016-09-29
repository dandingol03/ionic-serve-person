/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('loginController',function($scope,$state,$ionicLoading,$http,$rootScope){

    $scope.user={};

    //登录
    $scope.login = function(){

      $http({
        method:"POST",
        data:"grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
        url:"http://192.168.1.106:3000/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function(response){

        $rootScope.access_token=response.data.access_token;
        alert('access_token=' + $rootScope.access_token);
        return   $http({
          method: "post",
          url: "http://192.168.1.106:3000/svr/request",
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
        $state.go('tabs.dashboard');
      }).catch(function(err){
        var error='';
        for(var field in err)
        {
          error+=err[field]+'\r\n';
        }
        alert('error=' + error);
        $state.go('tabs.dashboard');
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
