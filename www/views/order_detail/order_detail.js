/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                                $interval,$cordovaMedia,$ionicLoading,$timeout,
                                               $ionicPopup,$state){

    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-接送站'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


    $scope.audio={
      pos:0
    }

    $scope.getServicePlaceByServicePersonId=function () {

      var servicePlaceType = null;
      if($scope.order.serviceType==11||$scope.order.serviceType==12||$scope.order.serviceType==13)
        servicePlaceType = 'unit';
      if($scope.order.serviceType==21||$scope.order.serviceType==22)
        servicePlaceType = 'place';
      if($scope.order.serviceType==23||$scope.order.serviceType==24)
        servicePlaceType = 'station';
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
            servicePlaceId: $scope.order.servicePlaceId,
            customerPlaceId:$scope.order.customerPlaceId,
            type: servicePlaceType
          }
        }
      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          $scope.order.servicePlace=json.data;

          if(servicePlaceType == 'unit')
            $scope.order.servicePlace.name=$scope.order.servicePlace.unitName;
          if(servicePlaceType == 'place')
          {}
          if(servicePlaceType == 'station'){
            $scope.order.servicePlace.name=$scope.order.servicePlace.servicePlace;
          }

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
      if(order.content.subServiceTypes!=null&&order.content.subServiceTypes!==undefined){
        var subServiceTypes=order.content.subServiceTypes;
        if(order.content.serviceType==13)
        {
          var serviceContent=order.content.subServiceTypes;
        }else{
          var types=subServiceTypes.split(',');
          var serviceContent=[];
          types.map(function(type,i) {
            serviceContent.push($scope.subServiceTypeMap[type]);
          });
        }
        order.content.subServiceContent=serviceContent;
      }

      if(order.content.serviceName==undefined||order.content.serviceName==null)
      {
        order.content.serviceName=$scope.serviceTypeMap[order.content.serviceType];
      }

      $scope.order=order.content;

      //TODO:计时
      $scope.applyTime=new Date($scope.order.applyTime);
      var timer=function () {
        var date=new Date();
        $scope.timeout=parseInt((date.getTime()-$scope.applyTime.getTime())/1000);
      }
      $scope.timer=$interval(timer,1000);


      $scope.getServicePlaceByServicePlaceId=function (type,placeId) {
        $http({
          method: "post",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'getServicePlaceByServicePlaceId',
            info: {
              type:type,
              placeId:placeId
            }
          }
        }).then(function (res) {
          var json=res.data;
          if(json.re==1) {
            $scope.order.servicePlace=json.data;
          }
        }).catch(function (err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('err=\r\n'+str);
        })
      }

      $scope.getCustomerPlaceByCustomerPlaceId=function (customerPlaceId) {

        $http({
          method: "post",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'getCustomerPlaceByCustomerPlaceId',
            info: {
              placeId:customerPlaceId
            }
          }
        }).then(function (res) {
          var json=res.data;
          if(json.re==1) {
            $scope.order.customerPlace=json.data;
          }
        }).catch(function (err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('err=\r\n'+str);
        })
      }

      //TODO:拉取维修厂所或者服务地点
      switch($scope.order.serviceType)
      {
        case '21':
          $scope.getServicePlaceByServicePlaceId($scope.order.serviceType,$scope.order.servicePlaceId);
          break;
        case '23':
          $scope.getServicePlaceByServicePlaceId($scope.order.serviceType,$scope.order.servicePlaceId);
          $scope.getCustomerPlaceByCustomerPlaceId($scope.order.customerPlaceId);
          break;
        default:
          if($scope.order.servicePersonId!==undefined&&$scope.order.servicePersonId!==null)
            $scope.getServicePlaceByServicePersonId($scope.order.servicePersonId);
          break;
      }


    }

    $scope.$on("$destroy", function() {
      if($scope.timer!==undefined&&$scope.timer!==null)
        $interval.cancel($scope.timer);
    })

    //音频检测
    $scope.checkAffiliateAudioSource=function () {

      $http({
        method: "post",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getCarServiceOrderAffiliatedAudioSource',
          info: {
            orderId:$scope.order.orderId
          }
        }
      }).then(function (res) {
        var json=res.data;
        var audioAttachId=json.data;
        if(json.re==1) {
          //音频下载
            $http({
              method: "post",
              url: Proxy.local() + "/svr/request",
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
              },
              data: {
                request: 'getAttachByAttachId',
                info: {
                  attachId: audioAttachId
                }
              }
            }).then(function (res) {
              var json = res.data;
              if (json.re == 1) {
                alert('urlAddress' + json.data.urlAddress);
                if(window.cordova!==undefined&&window.cordova!==null)
                {
                  var url = Proxy.local() + '/svr/request?request=downloadAttachment' + '&urlAddress=' + json.data.urlAddress;
                  var fileSystem=null;
                  if(ionic.Platform.isIOS()) {
                    fileSystem = cordova.file.documentsDirectory;
                    $scope.target = 'cdvfile://localhost/persistent/' + 'test.mp3';
                  }else if(ionic.Platform.isAndroid()) {
                    alert('cordova file=' + cordova.file);
                    fileSystem=cordova.file.externalApplicationStorageDirectory;
                    $scope.target=fileSystem+'test.mp3';
                  }



                  $scope.filepath=fileSystem+'test.mp3';
                  //var targetPath='cdvfile://localhost/persistent/Application/2AF47566-EE4A-41A8-94F5-73ED11427A80/ionic-serve-person.app/test.caf';
                  alert('target path=\r\n' + $scope.target);

                  var trustHosts = true;
                  var options = {
                    fileKey: 'file',
                    headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                    }
                  };

                  $cordovaFileTransfer.download(url, $scope.target, options, trustHosts)
                    .then(function (res) {
                      var json=res.response;
                      if(Object.prototype.toString.call(json)=='[object String]')
                        json=JSON.parse(json);
                      $scope.audioDownload=true;
                    }, function (err) {
                      // Error
                      alert('error=' + err);
                      for (var field in err) {
                        alert('field=' + field + '\r\n' + err[field]);
                      }
                    }, function (progress) {
                      $timeout(function () {
                        $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                      });
                    });

                }
              }
            }).catch(function(err) {
              alert('err=\r\n' + err);
            });

        }
      }).catch(function (err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('err=\r\n'+str);
      })
    }

    $scope.checkAffiliateVideoSource=function () {
      $http({
        method: "post",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getCarServiceOrderAffiliatedVideoSource',
          info: {
            orderId:$scope.order.orderId
          }
        }
      }).then(function (res) {
        var json=res.data;
        if(json.re==1) {
          var videoAttachId=json.data;
          //视频下载
            $http({
              method: "post",
              url: Proxy.local() + "/svr/request",
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
              },
              data: {
                request: 'getAttachByAttachId',
                info: {
                  attachId: videoAttachId
                }
              }
            }).then(function (res) {
              var json = res.data;
              if (json.re == 1) {
                alert('video url=' + json.data.urlAddress);

                var url = Proxy.local() + '/svr/request?request=downloadAttachment' + '&urlAddress=' + json.data.urlAddress;
                var fileSystem=null;
                if( ionic.Platform.isIOS()){
                  fileSystem=cordova.file.documentsDirectory;
                }else if(ionic.Platform.isAndroid()) {
                  fileSystem=cordova.file.externalApplicationStorageDirectory;
                }

                //$scope.movieTarget = 'cdvfile://localhost/persistent/' + 'test.mp4';
                $scope.movieTarget = fileSystem + 'test.mp4';
                $scope.movieFilepath=fileSystem+'test.mp4';
                //var targetPath='cdvfile://localhost/persistent/Application/2AF47566-EE4A-41A8-94F5-73ED11427A80/ionic-serve-person.app/test.caf';
                alert('target path=\r\n' + $scope.movieTarget);

                var trustHosts = true;
                var options = {
                  fileKey: 'file',
                  headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                  }
                };

                if(window.cordova!==undefined&&window.cordova!==null)
                {
                  $cordovaFileTransfer.download(url, $scope.movieTarget, options, trustHosts)
                    .then(function (res) {
                      var json=res.response;
                      if(Object.prototype.toString.call(json)=='[object String]')
                        json=JSON.parse(json);
                      $scope.videoDownload=true;
                    }, function (err) {
                      // Error
                      alert('error=' + err);
                      for (var field in err) {
                        alert('field=' + field + '\r\n' + err[field]);
                      }
                    }, function (progress) {
                      $timeout(function () {
                        $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                      });
                    });

                }
              }
            }).catch(function(err) {
              alert('err=\r\n' + err);
            });


        }
      }).catch(function (err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('err=\r\n'+str);
      })
    }

    //拉取附带的客户资源
    if(window.cordova)
    {
      $scope.checkAffiliateAudioSource();
      $scope.checkAffiliateVideoSource();
    }




    $scope.go_back=function(){
      if($scope.timer!==undefined&&$scope.timer!==null)
        $interval.cancel($scope.timer);
      switch($scope.order.orderState)
      {
        case 1:
          $rootScope.flags.serviceOrders.pageIndex=0;
          break;
        case 2:
          $rootScope.flags.serviceOrders.pageIndex=1;
          break;
        default:
          break;
      }
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


    //愿意接单
    $scope.takeOrder = function(){

      //如果订单是被筛选出来的
      if($scope.order.servicePersonId==null||$scope.order.servicePersonId==undefined){
        var servicePersonId=null;
        var unit=null;
        var place=null;
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


            var cmd=null;
            alert('serviceType=' + $scope.order.serviceType);
            switch($scope.order.serviceType)
            {
              case '11': case '12':  case '13': case '23':  case '24':
                cmd='getUnitByServicePerson';
                break;
              case '21': case 21:
                cmd='getDetectUnitByServicePerson';
                break;
              case '22':
                cmd='getServicePlaceByServicePerson';
                break;
              default:
                break;
            }

            alert('cmd=' + cmd);

            return  $http({
              method: "post",
              url:Proxy.local()+"/svr/request",
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
              },
              data:
              {
                request:cmd,
                info:{
                  servicePersonId:servicePersonId
                }
              }
            });
          }
        }).then(function(res) {

          var json=res.data;
          if(json.re==1) {

            place=json.data;
            var mobilePhone=null;
            if(place.mobilePhone!==undefined&&place.mobilePhone!==null&&place.mobilePhone!=='')
              mobilePhone=unit.mobilePhone;
            else if(place.phone!==undefined&&place.phone!==null&&place.phone!=='')
              mobilePhone=place.phone;
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
                  unitName:place.unitName!==undefined&&place.unitName!==null?place.unitName:place.name,
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
          var json=res.data;
          if(json.re==1) {
            $scope.order.candidateState=2;
            //TODO:merge time-prolong with close

            var myPopup = $ionicPopup.alert({
              template: '已发出接单请求',
              title: '信息'
            });
            $rootScope.flags.serviceOrders.clear=true;
            $rootScope.flags.serviceOrders.onFresh=true;
            myPopup.then(function (res) {
              $state.go('newDashboard');
            });
          }
        }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error(str);
        });

      }else{
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
              orderState:2,
              order:$scope.order,
              msg:""

            }
          }
        }).then(function(res) {

          if(res.re==1) {
            console.log('service order has been taken');
            $scope.go_back();
          }
        })
      }

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


    // var src = "/src/audio.mp3";
    // var media = $cordovaMedia.newMedia(src);
    // var iOSPlayOptions = {
    //   numberOfLoops: 2,
    //   playAudioWhenScreenIsLocked : false
    // }
    // media.play(iOSPlayOptions); // iOS only!
    // media.play(); // Android
    //
    // media.pause();
    //
    // media.stop();


    $scope.getDuration=function () {

      var filepath=$scope.filepath;
      filepath = filepath.replace('file://','');
      var media = $cordovaMedia.newMedia(filepath);
      if(ionic.Platform.isAndroid()) {
        media.setVolume(0.1);
        media.play();
      }
    }

    $scope.audioPlay=function () {
      var filepath=$scope.filepath;
      filepath = filepath.replace('file://','');
      var media = $cordovaMedia.newMedia(filepath);

      if(ionic.Platform.isIOS()) {
        var iOSPlayOptions = {
          numberOfLoops: 2,
          playAudioWhenScreenIsLocked : false
        }
        media.play(iOSPlayOptions); // iOS only!
      }else if(ionic.Platform.isAndroid()) {
        media.play();
        var posTimer=function () {
          media.media.getCurrentPosition(function (pos) {
            $scope.audio.pos=pos;
            if(pos>0)
            {
            }else{
              if($scope.timer!==undefined&&$scope.timer!==null)
                $interval.cancel($scope.timer);
            }
          });
        }
        $scope.timer=$interval(posTimer,40);


      }else{}
    }



    $scope.play=function(){

      /*** xcode path ***
       * file:///var/mobile/Containers/Data/Application/76687390-A99F-4220-9EB0-BB5A63154412/Documents/abc.caf
       */

      if($scope.audio.media!==undefined&&$scope.audio.media!==null)
      {}else{
        var filepath=$scope.filepath;
        filepath = filepath.replace('file://','');
        $scope.audio.media = $cordovaMedia.newMedia(filepath);
      }


      $scope.audio.media.media.getCurrentPosition(function (pos) {
        $scope.audio.pos=pos;
        if(pos>0)
        {
          var myPopup = $ionicPopup.alert({
            template: '音频还未播放结束',
            title: '信息'
          });
        }else{
          if(ionic.Platform.isIOS()) {
            var iOSPlayOptions = {
              numberOfLoops: 2,
              playAudioWhenScreenIsLocked : false
            }
            $scope.audio.media.play(iOSPlayOptions); // iOS only!
          }else if(ionic.Platform.isAndroid()) {
            $scope.audio.media.play();
            $scope.isPlaying=true;
            var timer=function () {
              $scope.audio.media.media.getCurrentPosition(function (pos) {
                if(pos<0)
                {
                  $scope.isPlaying=false;
                  if($scope.audio.timer!==undefined&&$scope.audio.timer!==null)
                    $interval.cancel($scope.audio.timer);
                }
              });
            }
            $scope.audio.timer=$interval(timer,500);
          }else{}
        }
      });

    }


    $scope.playMovie=function(){

      /*** xcode path ***
       * file:///var/mobile/Containers/Data/Application/76687390-A99F-4220-9EB0-BB5A63154412/Documents/abc.caf
       */

      var open = cordova.plugins.disusered.open;

      function success() {
        console.log('Success');
      }

      function error(code) {
        if (code === 1) {
          console.log('No file handler found');
        } else {
          console.log('Undefined error');
        }
      }

      var filepath=$scope.movieFilepath;
      open(filepath, success, error);

    }


    $scope.readFile=function(fileEntry) {

      fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
          console.log("Successful file read: " + this.result);
          alert(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

      }, function(err){
        alert('err=\r\n' + err);
      });
    }

    $scope.writeFile=function(fileEntry, dataObj) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
          console.log("Successful file write...");
          readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
          console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
          dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
      });
    }


    $scope.writeFile=function(fileEntry, dataObj) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
          console.log("Successful file write...");
          readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
          console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
          dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
      });
    }


    $scope.createFile=function(dirEntry, fileName, isAppend) {
      // Creates a new file or returns the file if it already exists.
      dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        $scope.writeFile(fileEntry, null, isAppend);

      }, function(err){
        alert('err=\r\n' + err);
      });
    }

    $scope.createTF=function(){
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

        alert('file system open: ' + fs.name);
        $scope.createFile(fs.root, "newTempFile.txt", false);

      }, function(err){
        alert('err=\r\n' + err);
      });
    }

    $scope.makePhone=function (phone) {

      $http({
        method: "post",
        url:Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
          {
            request:'fetchCustomerPhoneInServiceOrder',
            info:{
              order:$scope.order.orderId
            }
          }
      }).then(function (res) {
        var json=res.data;
        if(json.re==1) {
          var phone=json.data;
          window.PhoneCaller.call(phone,function () {
            console.log('successfully make phone call');
          }, function () {
            console.log('phone call encoutner error');
          });
        }
      }).catch(function (err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('err=\r\n'+str);
      })

    }


  });
