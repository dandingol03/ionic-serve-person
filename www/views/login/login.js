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
        url:"/proxy/node_server/login",
        headers: {
          'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
          'Content-Type': 'application/x-www-form-urlencoded'
        }

      }).success(function(response){

        $rootScope.access_token=response.access_token;
        $state.go('tabs.dashboard');

      }).error(function(err){
        var error='';
        for(var field in err)
        {
          error+=err[field]+'\r\n';
        }
        alert('error=' + error);
      });

    }






  });
