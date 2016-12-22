/**
 * Created by yiming on 16/11/26.
 */
angular.module('starter')

  .controller('myEvaluateController',function($scope,$state,$http,$rootScope,
                                            Proxy,$stateParams,$ionicPopover,
                                            $ionicLoading){


    $scope.goBack=function () {
      window.history.back();
    }

    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};

    $scope.evaluateHash={
      1:'极差',
      2:'失望',
      3:'一般',
      4:'满意',
      5:'惊喜'
    };

    //获取已结算状态下的服务订单
    $scope.getSquaredOrders=function () {
      $ionicLoading.show({
        template:'<p class="item-icon-left">拉取数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
      });

      $http({
        method: "post",
        url:Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
          {
            request:'getHistoryServiceOrders'
          }
      })
        .then(function (res) {
          var json=res.data;
          var evaluateTotal=0;
          var evaluateCount=0;
          if(json.re==1)
          {
            $scope.orders=json.data;
            if($scope.orders!==undefined&&$scope.orders!==null)
            {
              $scope.orders.map(function (order, i) {
                order.serviceName=$scope.serviceTypeMap[order.serviceType];
                if(order.evaluate!==undefined&&order.evaluate!==null)
                {
                  evaluateTotal+=order.evaluate;
                  evaluateCount++;
                }
              });
            }
          }
          if(evaluateCount==0)
            $scope.credit_average=0;
          else
            $scope.credit_average=evaluateTotal/evaluateCount;
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

    $scope.getSquaredOrders();



  })



