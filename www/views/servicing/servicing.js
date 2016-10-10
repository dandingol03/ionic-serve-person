/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('servicingController',function($scope,$state,$http,$rootScope){

    // $scope.orders=[
    //   [ {num:'000001',time:'2016-9-14',carNum:'鲁A00001',adr:'经十路',type:'日常保养',content:''},
    //     {num:'000002',time:'2016-9-14',carNum:'鲁A00002',adr:'经十路',type:'日常保养',content:''},
    //     {num:'000003',time:'2016-9-14',carNum:'鲁A00003',adr:'经十路',type:'日常保养',content:''}
    //   ],//全部订单
    //   [{num:'000001',time:'2016-9-14',carNum:'鲁A00001',adr:'经十路',type:'日常保养',content:''}],//维修订单数组
    //   [{num:'000002',time:'2016-9-14',carNum:'鲁A00002',adr:'经十路',type:'日常保养',content:''}],//救援订单数组
    //   [{num:'000003',time:'2016-9-14',carNum:'鲁A00003',adr:'经十路',type:'日常保养',content:''}]//鈑喷订单数组
    //
    // ];

    $scope.orders=[,[],[],[]];

    $http({
      method: "post",
      url: "/proxy/node_server/svr/request",
      //url:"http://192.168.1.106:3000/svr/request",
      headers: {
        'Authorization': "Bearer " + $rootScope.access_token,
      },
      data:
      {
        request:'getServiceOrderByState',
        state:2
      }
    })
      .success(function (response) {
        $scope.orders[0]=response.results;
        $scope.allOrders=response.results;
        $scope.allOrders.map(function(order,i) {
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
