/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('dashboardController',function($scope,$state,$http,$rootScope,
                                             Proxy,$stateParams,$ionicPopover,
                                              $ionicLoading){


   if($stateParams.action!==undefined&&$stateParams.action!==null&&$stateParams.action!=='')
   {
     var action=$stateParams.action;
     if(Object.prototype.toString.call(action)=='[object String]')
       action = JSON.parse(action);

     alert('type=' + action.type);
     if(action.type=='redirect')
     {
       alert('from=' + action.from);
       $scope.newOrder=action.order;
       if(action.from!==undefined&&action.from!==null)
       {
         $state.go('orderDetail', {order: JSON.stringify({content:action.order,from:action.from,timeout:action.timeout})});
       }
       else
         $state.go('orderDetail', {order: JSON.stringify({content:action.order})});
     }
   }


    $scope.orders=[,[],[],[]];
    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
                           21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车',
                           31:'鈑喷'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


    $scope.page_orders=[[],[],[],[]];
    $scope.pageLimit=3;
    $scope.pageIndexes=[0,0,0,0];


    $scope.getOrders=function () {
      $ionicLoading.show({
        template:'<p class="item-icon-left">拉取订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
      });

      $http({
        method: "post",
        url:Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
          {
            request:'getServiceOrdersWithinNotTaken'
          }
      })
        .then(function (res) {
          var json=res.data;
          if(json.re==1)
          {
            $scope.allOrders=json.data;
            $scope.orders[0]=json.data;
            $scope.allOrders.map(function(order,i) {
              order.serviceName=$scope.serviceTypeMap[order.serviceType];
              if(order.subServiceTypes!=null){
                var subServiceTypes=order.subServiceTypes;
                var types=subServiceTypes.split(',');
                var serviceContent=[];
                types.map(function(type,i) {
                  serviceContent.push($scope.subServiceTypeMap[type]);
                });
                order.subServiceContent=serviceContent;
              }

              var date=new Date(order.estimateTime);
              order.time=date.getFullYear().toString()+'-'
                +date.getMonth().toString()+'-'+date.getDate().toString();

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
          $ionicLoading.hide();
        }).catch(function(err) {
          var str='';
          for(var field in err)
          {
            str+=err[field];
          }
          console.error('err=\r\n'+str);
          $ionicLoading.hide();

      });

    }

    $scope.getOrders();




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
      //TODO:sync timeout with $rootScope
      if($rootScope.candidates[order.orderId]!==undefined&&$rootScope.candidates[order.orderId]!==null)
      {
        if($rootScope.candidates[order.orderId].timeout!==undefined&&$rootScope.candidates[order.orderId].timeout!==null)
          $state.go('orderDetail',{order:JSON.stringify({content:order,timeout:$rootScope.candidates[order.orderId].timeout})});
        else
          $state.go('orderDetail',{order:JSON.stringify({content:order})});
      }else{
        $state.go('orderDetail',{order:JSON.stringify({content:order})});
      }
    }

    /***  悬浮窗  ***/
    $ionicPopover.fromTemplateUrl('/views/popover/order_special_popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    /***  悬浮窗  ***/


    $scope.go_back=function(){
      window.history.back();
    };
    $scope.goto=function(){
      $state.go('register');
    };

  });
