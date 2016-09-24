/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('maintenanceLicenseController',function($scope,$state,$ionicLoading,$http,$rootScope){

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.photoType='maintenance_license';

  });
