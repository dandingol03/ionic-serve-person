/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('registerController',function($scope,$ionicActionSheet,$http,$q,$state,$rootScope){

    $scope.carServicePersonInfo={
    }

    //1.附件,通过图库
    $scope.pickImage=function(item,field){
      var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          item[field]=results[0];
          alert('img url=' + results[0]);
        }, function (error) {
          alert("error="+error);
          // error getting photos
        });
    };
    //2.附件,通过照片
    $scope.takePhoto=function(item,field){
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,
        correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imageURI) {
        item[field] = imageURI;
        alert('image url=' + item[field]);
      }, function(err) {
        // error
      });
    };

    //添加附件
    $scope.addAttachment=function(item,field)
    {
      $ionicActionSheet.show({
        buttons: [
          {text:'图库'},
          {text:'拍照'}
        ],
        cancelText: '关闭',
        cancel: function() {
          return true;
        },
        buttonClicked: function(index) {

          switch (index){
            case 0:
              $scope.pickImage(item,field);
              break;
            case 1:
              $scope.takePhoto(item,field);
              break;
            default:
              break;
          }
          return true;
        }
      });
    }

    $scope.uploadCarOwnerInfo=function(){
      $http({
        method: "POST",
        url: "/proxy/node_server/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'getLifeInsuranceList',
        }
      }).
        success(function (response) {
          $scope.lifeInfo=response.lifeInfo[0];
          console.log('success');
        })
    }

    $scope.goDoshBoard=function()
    {
      $state.go('tabs.dashboard');
    }

    $scope.Select=function(cmd,data,title,item,field) {

      $scope.fetch(cmd, data).then(function(json) {
        var sr=json.data;
        var buttons=[];
        sr.map(function(r,i) {
          buttons.push({text: r});
        });
        $ionicActionSheet.show({
          buttons:buttons,
          titleText: title!==undefined&&title!==null?title:'',
          cancelText: 'Cancel',
          buttonClicked: function(index) {
            item[field] = sr[index];
            return true;
          },
          cssClass:'service_person_register_modal'
        });
      });
    };


    $scope.fetch=function(cmd,data){

      var deferred=$q.defer();
      if(cmd!==undefined&&cmd!==null) {
        $http({
          method: "POST",
          url: "/proxy/node_server/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data:
          {
            request:cmd
          }
        }).then(function(res) {
          var json=res.data;
          deferred.resolve({re: 1, data: json.data});
        }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('error=\r\n' + str);
          deferred.reject({re: -1});
        })
      }else{
        deferred.resolve({re: 1, data: data});
      }
      return deferred.promise;
    };


    $scope.postPersonInfo=function(){
      $http({
        method: "POST",
        url: "/proxy/node_server/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'createInfoPersonInfo',
          info:$scope.carServicePersonInfo
        }
      }).
      success(function (response) {
          console.log('success');
      }).finally(function () {
          $state.go('tabs.dashboard');
        });
    };



    $scope.creatCarServicePerson=function(){
      $http({
        method: "POST",
        url: "/proxy/node_server/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:'createCarServicePerson',
          info:$scope.carServicePersonInfo
        }
      }).
      success(function (response) {
        console.log('success');
      })
    };


    $scope.go_back=function(){
      window.history.back();
    };

  });
