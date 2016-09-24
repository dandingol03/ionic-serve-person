/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('photoController',function($scope,$state,$stateParams,$http,$rootScope){

    $scope.go_back=function(){
      window.history.back();
    };

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



  });
