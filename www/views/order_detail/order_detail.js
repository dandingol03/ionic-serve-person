/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('orderDetailController',function($scope,$stateParams,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                                $interval,$cordovaMedia){


    var order=$stateParams.order;
    if(order!==undefined&&order!==null)
    {
      if(Object.prototype.toString.call(order)=='[object String]')
        order = JSON.parse(order);
      $scope.order=order.content;
    }

    $scope.order.audioAttachId=4;
    if($scope.order.audioAttachId!=null&&$scope.order.audioAttachId!=undefined){

      $http({
        method: "post",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getAttachByAttachId',
          info: {
            attachId: $scope.order.audioAttachId
          }
        }
      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          alert('urlAddress' + json.data.urlAddress);

          var url = Proxy.local() + '/svr/request?request=downloadAttachment' + '&urlAddress=' + json.data.urlAddress;
          var filesystem = cordova.file.documentsDirectory;
          var prefixIndex = filesystem.indexOf('/Application');
          $scope.target = 'cdvfile://localhost/persistent/' + 'test.mp3';

          $scope.filepath=filesystem+'test.mp3';
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
              alert('success');
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
      }).catch(function(err) {
        alert('err=\r\n' + err);
      });

    }

    //TODO:计时
    if(order.timeout!==undefined&&order.timeout!==null)
    {
      $scope.timer=$interval(function(){

        $rootScope.candidates[$scope.order.orderId].timeout++;
        $scope.timeout=$rootScope.candidates[$scope.order.orderId].timeout;
        console.log('timeout=' + $rootScope.candidates[$scope.order.orderId].timeout);
        if($rootScope.candidates[$scope.order.orderId].timeout>=120)
        {
          $interval.cancel($scope.timer);
          delete $rootScope.candidates[$scope.order.orderId];
        }
        },1000);
    }



    $scope.go_back=function(){
      if($scope.timer!==undefined&&$scope.timer!==null)
        $interval.cancel($scope.timer);
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

      //订单是被指派的
      else{
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



    $scope.play=function(){

      /*** xcode path ***
       * file:///var/mobile/Containers/Data/Application/76687390-A99F-4220-9EB0-BB5A63154412/Documents/abc.caf
       */

      var filepath=$scope.filepath;
      filepath = filepath.replace('file://','');
      var media = $cordovaMedia.newMedia(filepath);
      var iOSPlayOptions = {
        numberOfLoops: 2,
        playAudioWhenScreenIsLocked : false
      }
      media.play(iOSPlayOptions); // iOS only!
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



  });
