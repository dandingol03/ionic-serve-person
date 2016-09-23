/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams){

    $scope.order=$stateParams.order;

    if(Object.prototype.toString.call($scope.order)=='[Object String]')
      $scope.order = JSON.parse($scope.order);

    $scope.go_back=function(){
      window.history.back();
    };

  });
