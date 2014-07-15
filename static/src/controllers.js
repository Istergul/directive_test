'use strict';

angular.module('app.controllers', [])
.controller('MainCtrl', ["$scope", "$rootScope", "$http", "Tasks", "security",
        function($scope, $rootScope, $http, Tasks, security) {

    $scope.selectPage = function(page) {
        console.log('select page', page);
    };
}])
;
