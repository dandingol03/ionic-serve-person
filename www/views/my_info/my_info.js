/**
 * Created by yiming on 16/9/14.
 */
angular.module('starter')

  .controller('myInfoController',function($scope,$state,$http,$ionicActionSheet,$ionicModal,$q) {

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.goto=function(state,type){
      if(type!==undefined&&type!==null)
        $state.go(state,{photoType:type});
      else
        $state.go(state);
    }

    //接口抽离
    $scope.Modals={
      modals:[],
      initModals:function(templates) {

        templates.map(function(template,i) {
          $ionicModal.fromTemplateUrl(template,{
            scope:  $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            var reg=/\/modal\/(.*)\.html$/;
            var name=reg.exec(template)[1];
            $scope.Modals.modals.push({name: name, modal: modal});
          });

        }.bind(this));
      }.bind(this),
      openModal:function(name){
        var modal=null;
        this.modals.map(function(ins,i) {
          if(ins.name==name)
            modal=ins.modal;
        });
        if(modal!==null)
          modal.show();
      },
      closeModal:function(name){
        var modal=null;
        this.modals.map(function(ins,i) {
          if(ins.name==name)
            modal=ins.modal;
        });
        modal.hide();
      }
    };
    //注册模态框
    //$scope.Modals.initModals(['views/modal/maintenance_license.html']);

    $scope.myInfo={

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

    $scope.order_intend='';
    $scope.order_intends=['维修','车驾管'];
    //接单偏好选择
    $scope.set_order_intend=function() {

      var buttons=[];
      $scope.order_intends.map(function(price,i) {
        buttons.push({text: price});
      });
      $ionicActionSheet.show({
        buttons:buttons,
        titleText: '选择接单偏好',
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.order_intend= $scope.order_intends[index];
          return true;
        },
        cssClass:'motor_insurance_actionsheet'
      });

    }


  })
