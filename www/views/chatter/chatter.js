/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('chatterController',function($scope,$state,$ionicLoading,
                                           $stateParams,$ionicActionSheet,$ionicPopup,
                                           $ionicScrollDelegate,$http,$rootScope){




    $scope.messages=[
      {
        userId: '534b8e5aaa5e7afc1b23e69b',
        date: new Date(),
        text: 'Lorem ipsum dolor sit amet, ' +
        'consectetur adipiscing elit, ' +
        'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
      },
      {
        userId: '134b8e5aa53e2afc1b23e78b',
        date: new Date(),
        text: 'i hate this guy, tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
      }];

    $scope.input={

    };



    $scope.viewProfile=function(msg){
      console.log('...');
    }


  });
