/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('dashboardController',function($scope,$state,$http,$rootScope){


    // $scope.orders=[
    //   [ {num:'000001',time:'2016-9-14',carNum:'鲁A00001',adr:'经十路',type:'日常保养',content:''},
    //     {num:'000002',time:'2016-9-14',carNum:'鲁A00002',adr:'经十路',type:'日常保养',content:''},
    //     {num:'000003',time:'2016-9-14',carNum:'鲁A00003',adr:'经十路',type:'日常保养',content:''}
    //     ],//全部订单
    //   [{num:'000001',time:'2016-9-14',carNum:'鲁A00001',adr:'经十路',type:'日常保养',content:''}],//维修订单数组
    //   [{num:'000002',time:'2016-9-14',carNum:'鲁A00002',adr:'经十路',type:'日常保养',content:''}],//救援订单数组
    //   [{num:'000003',time:'2016-9-14',carNum:'鲁A00003',adr:'经十路',type:'日常保养',content:''}]//鈑喷订单数组
    //
    // ];

    $scope.orders=[];

    $http({
      method: "post",
      url: "/proxy/node_server/svr/request",
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
        $scope.orders=[
          response.results,
          [{num:'000001',time:'2016-9-14',carNum:'鲁A00001',adr:'经十路',type:'日常保养',content:''}],//维修订单数组
          [{num:'000002',time:'2016-9-14',carNum:'鲁A00002',adr:'经十路',type:'日常保养',content:''}],//救援订单数组
          [{num:'000003',time:'2016-9-14',carNum:'鲁A00003',adr:'经十路',type:'日常保养',content:''}]//鈑喷订单数组
        ];
        $scope.orders[0]=response.results;
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
      $state.go('orderDetail',{order:order});
    }

    $scope.go_back=function(){
      window.history.back();
    };
    $scope.goto=function(){
      $state.go('register');
    };

  });