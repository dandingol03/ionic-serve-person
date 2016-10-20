/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                                $interval){

     var order=$stateParams.order;
    if(order!==undefined&&order!==null)
    {
      if(Object.prototype.toString.call(order)=='[object String]')
        order = JSON.parse(order);
      $scope.order=order.content;
    }

    //TODO:计时
    if(order.timeout!==undefined&&order.timeout!==null&&order.timeout<120)
    {
      $scope.timeout=order.timeout;
      $scope.timer=$interval(function(){
        $scope.timeout++;
        if($scope.timeout>=120)
          $interval.cancel($scope.timer);
        },1000);
    }



    $scope.go_back=function(){
      window.history.back();
    };

    $scope.$on("$destroy", function() {
      if($scope.timer!==undefined&&$scope.timer!==null)
        $interval.cancel($scope.timer);
    })

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

    $scope.download=function(){
      var url='http://192.168.1.106:3000/svr/request?request=downloadAttachment&filename=carPhoto_5.png'
      var targetPath=cordova.file.externalRootDirectory + "/carPhoto_5.png";
      var trustHosts = true;
      var options = {
        fileKey:'file',
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        method:'POST'
      };
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
          alert('success');
        }, function(err) {
          // Error
          var str='';
          for(var field in err)
          {
            str+=field+':'+err[field];
          }
          alert('error=====\r\n'+str);
        }, function (progress) {

        });
    }


    //愿意接单
    $scope.takeOrder = function(){
      var servicePersonId=null;
      var unit=null;
      var servicePersonName=null;
      $http({
        method: "post",
        url:Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'getServicePersonIdByPersonId'

        }
      }).then(function(res) {
        var json=res.data;
        if(json.re==1) {
          servicePersonId=json.data;

          return  $http({
            method: "post",
            url:Proxy.local()+"/svr/request",
            headers: {
              'Authorization': "Bearer " + $rootScope.access_token,
            },
            data:
            {
              request:'getUnitByServicePerson',
              info:{
                servicePersonId:servicePersonId
              }
            }
          });
        }
      }).then(function(res) {

        var json=res.data;
        if(json.re==1) {
          alert('send')
          unit=json.data;
          var mobilePhone=null;
          if(unit.mobilePhone!==undefined&&unit.mobilePhone!==null)
            mobilePhone=unit.mobilePhone;
          else if(unit.phone!==undefined&&unit.phone!==null)
            mobilePhone=unit.phone;
          return  $http({
            method: "post",
            url:Proxy.local()+"/svr/request",
            headers: {
              'Authorization': "Bearer " + $rootScope.access_token
            },
            data:
            {
              request:'sendCustomMessage',
              info:{
                unitName:unit.unitName,
                mobilePhone:mobilePhone,
                type:'to-customer',
                order:$scope.order
              }
            }
          });
        }
      }).then(function(res) {
          var json=res.data;
          if(json.re==1){

            alert('dddddd');
            return $http({
              method: "post",
              url: Proxy.local() + "/svr/request",
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token
              },
              data: {
                request: 'updateCandidateStateByServicePersonId',
                info: {
                  orderId: $scope.order.orderId,
                  servicePersonId: servicePersonId,
                  candidateState:2
                }
              }
            });

          }

      }).then(function(res) {

        if(res.re==1) {
          console.log('service order has been generated');
          $scope.go_back();
        }
      }).catch(function(err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error(str);
      });

    }

    $scope.changeOrderState = function(state){
      $http({
        method: "post",
        url:Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'updateServiceOrderState',
          info:{
            orderState:state,
            order:$scope.order,
            msg:""

          }
        }
      })
    }


  });
