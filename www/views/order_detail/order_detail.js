/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams,$http,$rootScope,$cordovaFileTransfer){

    $scope.order=$stateParams.order;

    if(Object.prototype.toString.call($scope.order)=='[object String]')
      $scope.order = JSON.parse($scope.order);

    $scope.go_back=function(){
      window.history.back();
    };

    $http({
      method:"post",
      url:"http://192.168.1.106:3000/svr/request",
      //url:"/proxy/node_server/svr/request",
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



    $scope.takeOrders = function(){
      $http({
        method: "post",
        url: "/proxy/node_server/svr/request",
        //url:"http://192.168.1.106:3000/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'updateServiceOrderStateAndServicePersonId',
          info:{
            order:$scope.order,
            orderState:2
          }
        }
      }).then(function(res) {
              var json=res.data;
              if(json.re==1) {
                console.log('service order has been generated');
              }
            }).catch(function(err) {
              var str='';
              for(var field in err)
                str+=err[field];
              console.error('error=\r\n' + str);
            });

    };

    $scope.changeOrderState = function(state){
      $http({
        method: "post",
        url: "/proxy/node_server/svr/request",
        //url:"http://192.168.1.106:3000/svr/request",
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
