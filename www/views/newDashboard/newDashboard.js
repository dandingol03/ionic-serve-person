/**
 * Created by yiming on 16/11/26.
 */
angular.module('starter')

  .controller('newDashboardController',function($scope,$state,$http,$rootScope,
                                             Proxy,$stateParams,$ionicPopover){


    $scope.orders = [
      {orderNum:'S201611260001',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:1},
      {orderNum:'S201611260002',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:1},
      {orderNum:'S201611260003',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:1},
      {orderNum:'S201611260004',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:2},
      {orderNum:'S201611260005',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:2},
      {orderNum:'S201611260006',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:2},
      {orderNum:'S201611260007',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:3},
      {orderNum:'S201611260008',serviceType:'维修-日常保养',time:'2016-11-26 9:00-11:00',orderState:3}];


    $scope.tabIndex=0;
    $scope.tab_change = function(i){
      $scope.tabIndex=i;
    }
    $scope.selectedTabStyle=
    {display:'inlineBlock',width:'33.333333%','border-right': '1px solid','border-color': '#c7eeec','background-color':'#c7eeec'};
    $scope.unSelectedTabStyle=
    {display:'inlineBlock',width:'33.333333%','border-right': '1px solid','border-color': '#c7eeec'};
    $scope.selectedTabStyle1=
    {display:'inlineBlock',width:'33.333333%','border-color': '#c7eeec','background-color':'#c7eeec'};
    $scope.unSelectedTabStyle1=
    {display:'inlineBlock',width:'33.333333%','border-color': '#c7eeec'};





  })



