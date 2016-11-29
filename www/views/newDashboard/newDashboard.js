/**
 * Created by yiming on 16/11/26.
 */
angular.module('starter')

  .controller('newDashboardController',function($scope,$state,$http,$rootScope,
                                             Proxy,$stateParams,$ionicPopover,
                                                $ionicLoading,$ionicSideMenuDelegate,$ionicTabsDelegate){




    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


    $scope.tabIndex=0;
    $scope.tab_change = function(i){
      $scope.tabIndex=i;
    }
    $scope.selectedTabStyle=
    {
      display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
    };
    $scope.unSelectedTabStyle=
    {
      display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
    };
    $scope.selectedTabStyle1=
    {
      display:'inline-block',width:'32%',height:'100%','border-color': '#c7eeec','background-color':'#c7eeec'
    };
    $scope.unSelectedTabStyle1=
    {
      display:'inline-block',width:'32%',height:'100%','border-color': '#c7eeec'
    };



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
            $scope.orders={0:[],1:[],2:[]};
            $scope.orders[0]=json.data;

            $scope.orders[0].map(function(order,i) {

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

              //estimateTime为订单的预计时间

              if(order.serviceType=='11'||order.serviceType=='12'||order.serviceType=='13')
                $scope.orders[1].push(order);
              if(order.serviceType=='21'||order.serviceType=='22'||order.serviceType=='23'||order.serviceType=='24')
                $scope.orders[2].push(order);
            });
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

    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.changeIndex=function (i) {
      if(i==2)
      {
        //TODO:open self configure panel
        $ionicSideMenuDelegate.toggleLeft();
      }
      $ionicTabsDelegate.select(i);
    }


  })



