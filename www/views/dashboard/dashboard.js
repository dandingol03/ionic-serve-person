/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('dashboardController',function($scope,$state,$http,$rootScope,Proxy){



    $scope.orders=[,[],[],[]];
    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
                           21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车',
                           31:'鈑喷'};
    $http({
      method: "post",
      url:Proxy.local()+"/svr/request",
      headers: {
        'Authorization': "Bearer " + $rootScope.access_token,
      },
      data:
      {
        request:'getServiceOrderByState',
        state:1
      }
    })
      .success(function (response) {
        $scope.orders[0]=response.results;
        $scope.allOrders=response.results;
        $scope.allOrders.map(function(order,i) {
          order.serviceName=$scope.serviceTypeMap[order.serviceType];
          if(order.serviceType==11||order.serviceType==12||order.serviceType==13)
            $scope.orders[1].push(order);
          if(order.serviceType==21||order.serviceType==22||order.serviceType==23||order.serviceType==24)
            $scope.orders[2].push(order);
          if(order.serviceType==31)
            $scope.orders[3].push(order);
        });

        console.log('success');
      })

    $scope.tabIndex=0;

    $scope.tab_change=function(i){
      $scope.tabIndex=i;
    };

    $scope.go_detail=function(item){
      $scope.detail=item;
    }

    $scope.go_back_from_detail=function(){
      $scope.detail=null;
    }

    $scope.showOrderDetail=function(order){
      $state.go('orderDetail',{order:JSON.stringify(order)});
    }

    $scope.go_back=function(){
      window.history.back();
    };
    $scope.goto=function(){
      $state.go('register');
    };

  });
