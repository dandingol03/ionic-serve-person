/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams,$http,$rootScope){

    $scope.order=$stateParams.order;

    if(Object.prototype.toString.call($scope.order)=='[object String]')
      $scope.order = JSON.parse($scope.order);

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.takeOrders = function(){
      $http({
        method: "post",
        url: "/proxy/node_server/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'updateServiceOrderState',
          info:{
            orderNum:$scope.order.orderNum,
            orderState:2
          }
        }
      })
        .success(function (response) {
          console.log('success');
        })

    };


  });
