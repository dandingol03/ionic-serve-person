/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDoneDetailController',function($scope,$stateParams,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                               $interval,$cordovaMedia,$ionicLoading,$timeout){


    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};



    $scope.stars=[
      {index:0,checked:false},
      {index:1,checked:false},
      {index:2,checked:false},
      {index:3,checked:false},
      {index:4,checked:false}
    ];

    $scope.go_back=function(){
      window.history.back();
    };



    $scope.getServicePlace=function (servicePlaceId) {
      $ionicLoading.show({
        template:'<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
      });

      $http({
        method: "post",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getServicePlaceNameByPlaceId',
          info: {
            placeId:servicePlaceId,
            type:'unit'
          }
        }
      }).then(function(res) {
        var json=res.data;
        $scope.order.servicePlace=json.data;
        alert('servicePlace=$scope.order.servicePlace');
        $ionicLoading.hide();
      }).catch(function (err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('err=\r\n'+str);
        $ionicLoading.hide();
      });
    }

    $scope.getServicePlaceByServicePersonId=function () {

      $http({
        method: "post",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getServicePlaceByServicePersonId',
          info: {
            servicePersonId: $scope.order.servicePersonId,
            type: 'unit'
          }
        }
      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          $scope.order.servicePlace=json.data;
          $scope.order.servicePlace.name=$scope.order.servicePlace.unitName;
        }
      }).catch(function (err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('err=\r\n'+str);
      });
    }





    var order=$stateParams.order;
    if(order!==undefined&&order!==null)
    {
      if(Object.prototype.toString.call(order)=='[object String]')
        order = JSON.parse(order);
      if(order.content.subServiceTypes!=null){
        var subServiceTypes=order.content.subServiceTypes;
        var types=subServiceTypes.split(',');
        var serviceContent=[];
        types.map(function(type,i) {
          serviceContent.push($scope.subServiceTypeMap[type]);
        });

        order.content.subServiceContent=serviceContent;
      }

      $scope.order=order.content;

      //对应服务订单中的维修类别拉取地点
      if($scope.order.servicePersonId!==undefined&&$scope.order.servicePersonId!==null)
        $scope.getServicePlaceByServicePersonId($scope.order.servicePersonId);

      //对应服务订单中的审车类别拉取地点
      if($scope.order.serviceType==21||$scope.order.serviceType==22||$scope.order.serviceType==23||$scope.order.serviceType==24)
      {

        $http({
          method: "post",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'getServicePlace',
            info: {
              placeId:$scope.order.servicePlaceId
            }
          }
        }).then(function (res) {
          var json=res.data;
          $scope.order.servicePlace=json.data;
        }).catch(function (err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('err=\r\n'+str);
        });
      }

      //对应服务订单中的接送机类别拉取地点
      if($scope.order.serviceType==23)
      {

      }
    }


    //填取评价级别
    if($scope.order.evaluate!==undefined&&$scope.order.evaluate!==null)
    {
      for(var i=0;i<parseInt($scope.order.evaluate);i++)
      {
        $scope.stars[i].checked=true;
      }
      $scope.starCount=parseInt($scope.order.evaluate);
    }


    $http({
      method:"post",
      url:Proxy.local()+"/svr/request",
      headers:{
        'Authorization': "Bearer " + $rootScope.access_token,
      },
      data:
      {
        request:'getCarInfo',
        info:{
          order:$scope.order
        }
      }
    }).then(function(res) {
      var json=res.data;
      if(json.re==1) {
        var ins=json.data;
        if(ins!=undefined&&ins!=null){
          $scope.order.carNum=ins.carNum;
        }
      }
    }).catch(function(err) {
      var str='';
      for(var field in err)
        str+=err[field];
      console.error('error=\r\n' + str);
    });



  });
