/**
 * Created by yiming on 16/11/26.
 */
angular.module('starter')

  .controller('newDashboardController',function($scope,$state,$http,$rootScope,
                                             Proxy,$stateParams,$ionicPopover,
                                                $ionicLoading,$ionicSideMenuDelegate,$ionicTabsDelegate,
                                                $cordovaFile,$q,$cordovaFileTransfer,
                                                $cordovaMedia,$timeout,$cordovaPreferences,
                                              $ionicHistory,$ionicPopup){




    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-接送站'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


    $rootScope.$on('__REFRESH__', function(event, args) {
      console.log('...data refresh...');
    });

    $scope.goto=function (state) {
      $state.go(state);
    }

    //监听用户的取消订单消息
    $rootScope.$on('ORDER_CANCEL', function(event, data) {

      var confirmPopup = $ionicPopup.confirm({
        title: '信息',
        template: data
      });
      confirmPopup.then(function(res) {
        if(res) {
          $scope.getOrders();
        }
      })
    });

    //监听用户的完成订单消息
    $rootScope.$on('ORDER_FINISH', function(event, data) {

      var confirmPopup = $ionicPopup.confirm({
        title: '信息',
        template: data
      });
      confirmPopup.then(function(res) {
        if(res) {
          $scope.getOrders();
        }
      })
    });




    //退出
    $scope.quit=function () {
      //TODO:inject service person quit
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
      if(window.cordova)
      {
        $cordovaPreferences.store('username', '')
          .success(function(value) {
            $cordovaPreferences.store('password', '')
              .success(function(value) {
                $state.go('login');
              })
              .error(function(error) {
                console.error("Error: " + error);
              })
          })
          .error(function(error) {
            console.error("Error: " + error);
          })
      }
      $rootScope.$emit('ACK_QUIT', 'ack successfully');
    }

    $scope.tabIndex=0;
    $scope.tab_change = function(i){
      $scope.tabIndex=i;
    }

    $scope.pageIndex=0;

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
            $rootScope.flags.serviceOrders.data.notTakens=[];
            if(json.data!==undefined&&json.data!==null)
            {
              $scope.orders[0]=json.data;
              $rootScope.flags.serviceOrders.data.notTakens=json.data;
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

            //拉取服务中的订单
            return $http({
              method: "post",
              url:Proxy.local()+"/svr/request",
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
              },
              data:
                {
                  request:'getServiceOrdersInTaken'
                }
            });
          }else
          {
            $timeout(function () {
              var myPopup = $ionicPopup.alert({
                template: '非法的服务人员帐号',
                title: '错误'
              });
            },400);
          }
        }).then(function (res) {
          var json=res.data;
          $rootScope.flags.serviceOrders.data.takens=json.data;
          $scope.takens=[];
          if(json.data!==undefined&&json.data!==null)
          {
            json.data.map(function (order, i) {
              order.serviceName=$scope.serviceTypeMap[order.serviceType];
              $scope.takens.push(order);
            });
          }
          $rootScope.flags.serviceOrders.onFresh=false;
          $ionicLoading.hide();
      }).catch(function(err) {
        var msg=err.message;
        console.error('err=\r\n'+msg);
        $ionicLoading.hide();

      });

    }


    $scope.changeIndex=function (i) {
      if(i==2)
      {
        //TODO:open self configure panel
        $ionicSideMenuDelegate.toggleLeft();
      }
      if(i!=2)
        $scope.pageIndex=i;
      $ionicTabsDelegate.select(i);
    }


    if($rootScope.flags.serviceOrders.pageIndex!==undefined&&$rootScope.flags.serviceOrders.pageIndex!==null
      &&$rootScope.flags.serviceOrders.pageIndex>0)
    {
      $timeout(function () {
        $scope.changeIndex($rootScope.flags.serviceOrders.pageIndex);
      }, 100);
    }


    if($rootScope.flags.serviceOrders.onFresh==true)
    {
      $scope.getOrders();
    }else{
      var notTakens=$rootScope.flags.serviceOrders.data.notTakens;
      var takens=$rootScope.flags.serviceOrders.data.takens;

        $scope.orders={0:[],1:[],2:[]};
        $scope.orders[0]=notTakens;
      if($scope.orders[0]!==undefined&&$scope.orders[0]!==null&&$scope.orders[0].length>0)
      {
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



      $scope.takens=[];
      if(takens!==undefined&&takens!==null&&takens.length>0)
      {
        takens.map(function (order, i) {
          order.serviceName=$scope.serviceTypeMap[order.serviceType];
          $scope.takens.push(order);
        });
      }


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

    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

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

    //menu切换回调
    $scope.$watch($ionicSideMenuDelegate.isOpen(),function (newValue,oldValue,scope) {
      console.log('new=' + newValue);
      console.log('old=' + oldValue);
    });



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



