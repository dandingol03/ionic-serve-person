/**
 * Created by yiming on 16/11/26.
 */
angular.module('starter')

  .controller('orderDoneController',function($scope,$state,$http,$rootScope,
                                                Proxy,$stateParams,$ionicPopover,
                                                $ionicLoading, $q, $cordovaMedia){


    $scope.go_back=function () {
      $rootScope.flags.serviceOrders.pageIndex=2;
      window.history.back();
    }


    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};




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
          request:'getServiceOrders',
          info:{
            orderState:3
          }
        }
      })
        .then(function (res) {
          var json=res.data;
          if(json.re==1)
          {
            $scope.orders=json.data;
            $scope.orders.map(function (order, i) {
              order.serviceName=$scope.serviceTypeMap[order.serviceType];
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

        $state.go('orderDone_detail',{order:JSON.stringify({content:order})});

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

    $scope.playPool=function (files,interval) {
      var filePath=files[0];
      alert('init media');
      console.log('filePath='+filePath);

      var media = $cordovaMedia.newMedia(filePath);
      media.play();
      var newFiles=files;
      newFiles.splice(0, 1);

      $timeout(function () {
        alert('next time')
        media.release();
        if(newFiles.length>=1)
          $scope.playPool(newFiles, interval);
      },interval);

    }




    //语音播报
    $scope.orderBroadcast=function () {
      if($scope.orders[0]!==undefined&&$scope.orders[0]!==null&&$scope.orders[0].length>0)
      {

        //TODO:新建orders文件夹存放生成的mp3文件
        if (ionic.Platform.isIOS()) {
          //IOS平台
        }else if(ionic.Platform.isAndroid())
        {
          var fileSystem=null;
          fileSystem=cordova.file.externalApplicationStorageDirectory;


          var splicedOrders = $scope.orders[0].splice(0, 8);

          $cordovaFile.createDir(fileSystem, "speech", true)
            .then(function (success) {

              return {re: 1};

            }).then(function (json) {
            if(json.re==1) {
              var promises=[];
              var  fileSystem=cordova.file.externalApplicationStorageDirectory;

              var statistics={
                target:splicedOrders.length,
                promises:[]
              }
              for(var i=0;i<splicedOrders.length;i++)
              {
                var order=splicedOrders[i];
                var callback=function (ob,item) {

                  var deferred=$q.defer();

                  var url = Proxy.local() + '/svr/request?request=generateBatchTTSSpeech' + '&text=' +
                    '订单号为'+item.orderNum+'的订单可以接单'+'&ttsToken='+$rootScope.ttsToken+'&id='+item.orderNum;
                  var target=fileSystem+'speech/'+item.orderNum+'.mp3';
                  var trustHosts = true;
                  var options = {
                    fileKey: 'file',
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                    }
                  };

                  $cordovaFileTransfer.download(url, target, options, trustHosts)
                    .then(function (res) {



                      deferred.resolve({re: 1});
                    }, function (err) {
                      // Error
                      alert('error=' + err);
                      for (var field in err) {
                        alert('field=' + field + '\r\n' + err[field]);
                      }
                      deferred.reject({});
                    }, function (progress) {
                    });
                  ob.promises.push(deferred.promise);


                };
                callback(statistics,order);
              }

              return $q.all(statistics.promises);
            }
          }).then(function(json) {
            console.log('all audio file are done');


            if(ionic.Platform.isIOS()) {
            }else if(ionic.Platform.isAndroid()) {
              var files=[];
              for(var i=0;i<8;i++) {
                var order=splicedOrders[i];
                var cb=function (item) {
                  var filepath=fileSystem+'speech/'+item.orderNum+'.mp3';
                  filepath = filepath.replace('file://','');
                  files.push(filepath);
                  // var media = $cordovaMedia.newMedia(filepath);
                  // media.play();
                  // media.media.getDurationAudio(function(p) {
                  //   alert('duration='+p);
                  // });
                };
                cb(order);
              }
              $scope.playPool(files,6000);
            }else{}

          }).catch(function(err) {
            var str='';
            for(var field in err)
              str+=err[field];
            console.error('err=\r\n'+str);
          });



        }else{}

      }
    }


  })



