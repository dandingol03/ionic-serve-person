/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('dashboardController',function($scope,$state,$http,$rootScope,
                                             Proxy,$stateParams){


   if($stateParams.action!==undefined&&$stateParams.action!==null&&$stateParams.action!=='')
   {
     var action=$stateParams.action;
     if(Object.prototype.toString.call(action)=='[object String]')
       action = JSON.parse(action);
     console.log('actionType.....\r\n'+action.type);
     if(action.type=='redirect')
     {
       $scope.newOrder=action.order;
       $state.go('orderDetail', {order: JSON.stringify($scope.newOrder)});
     }
   }


    $scope.orders=[,[],[],[]];
    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
                           21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车',
                           31:'鈑喷'};


    $scope.page_orders=[[],[],[],[]];
    $scope.pageLimit=3;
    $scope.pageIndexes=[0,0,0,0];

    $http({
      method: "post",
      url:Proxy.local()+"/svr/request",
      headers: {
        'Authorization': "Bearer " + $rootScope.access_token,
      },
      data:
      {
        request:'getOrdersFromServiceCandidate',

      }
    })
      .then(function (res) {
        var json=res.data;
        if(json.re==1)
        {
          $scope.allOrders=json.data.orders;
          $scope.orders[0]=json.data.orders;
          $scope.allOrders.map(function(order,i) {
            order.serviceName=$scope.serviceTypeMap[order.serviceType];
            if(order.serviceType=='11'||order.serviceType=='12'||order.serviceType=='13')
              $scope.orders[1].push(order);
            if(order.serviceType=='21'||order.serviceType=='22'||order.serviceType=='23'||order.serviceType=='24')
              $scope.orders[2].push(order);
            if(order.serviceType=='31')
              $scope.orders[3].push(order);
          });
         //initial first-page data
          var j=0;
          for(var i=$scope.pageIndexes[0]*$scope.pageLimit;i<$scope.orders[0].length;i++) {
            if(j<$scope.pageLimit)
            {
              $scope.page_orders[0].push($scope.orders[0][i]);
              j++;
            }
            else
              break;
          }

          //initial maintain-page data
          j=0;
          for(var i=$scope.pageIndexes[1]*$scope.pageLimit;i<$scope.orders[1].length;i++) {
            if(j<$scope.pageLimit)
            {
              $scope.page_orders[1].push($scope.orders[1][i]);
              j++;
            }
            else
              break;
          }

          //initial car-manage data
          j=0;
          for(var i=$scope.pageIndexes[2]*$scope.pageLimit;i<$scope.orders[2].length;i++) {
            if(j<$scope.pageLimit)
            {
              $scope.page_orders[2].push($scope.orders[2][i]);
              j++;
            }
            else
              break;
          }


        }

      });

    $scope.page_previous=function(index){
      var curIndex=($scope.pageIndexes[index]-1)*$scope.pageLimit;
      if(curIndex>=0) {
        $scope.pageIndexes[index]--;
        var j=0;
        $scope.page_orders[index]=[];
        for(var i=curIndex;i<$scope.orders[index].length;i++)
        {
          if(j<$scope.pageLimit)
          {
            $scope.page_orders[index].push($scope.orders[index][i]);
            j++;
          }
          else
            break;
        }

      }
    }

    $scope.page_next=function(index){
      var curIndex=($scope.pageIndexes[index]+1)*$scope.pageLimit;
      if(curIndex<$scope.orders[index].length) {
        $scope.pageIndexes[index]++;
        var j=0;
        $scope.page_orders[index]=[];
        for(var i=curIndex;i<$scope.orders[index].length;i++)
        {
          if(j<$scope.pageLimit)
          {
            $scope.page_orders[index].push($scope.orders[index][i]);
            j++;
          }
          else
            break;
        }
      }
    }


    $scope.orderIndex=0;

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
