/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('photoController',function($scope,$state,$stateParams,$rootScope,
                                         $cordovaImagePicker,$cordovaCamera,
                                         $ionicActionSheet,$q,$cordovaFileTransfer){

   $scope.unit={
   };

    // 默认标签页设置
    if($stateParams.photoType!==undefined&&$stateParams.photoType!==null)
    {
      $scope.photoType = $stateParams.photoType;
      if(Object.prototype.toString($scope.photoType)=='[object String]')
        $scope.photoType = JSON.parse($scope.photoType);
    }
    else
    {
      $scope.photoType='maintenance_license';
    }

    //添加附件
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

    //进行附件添加
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




    $scope.upload=function(item,field){

        var suffix='';
        if(item[field].toString().indexOf('.jpg')!=-1)
          suffix='jpg';
        else if(item[field].toString().indexOf('.png')!=-1)
          suffix='png';
        else{}
        var server='/proxy/node_server/svr/request?request=uploadPhoto' +
          '&imageType='+$scope.photoType+'&suffix='+suffix;
        var options = {
          fileKey:'file',
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token
          }
        };
        $cordovaFileTransfer.upload(server, item[field], options)
          .then(function(result) {
            // Success!
            alert('upload success');
          }, function(err) {
            var str='';
            for(var field in err)
              str+=field+':'+err[field];
            alert('encounter error=====\r\n'+str);
          }, function (progress) {
            // constant progress updates
          });


    }

    $scope.go_back=function(){
      window.history.back();
    };

  });
