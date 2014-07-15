'use strict';

var module = angular.module('app', [
    'ngCookies',
    'ngRoute',

    'app.directives',
    'app.controllers',
    'app.services'
])

.config(["$interpolateProvider", function($interpolateProvider){
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
}])

.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
}])

.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
}])

.config(["$routeProvider", function ($routeProvider) {

}])

.run(["$http", "$cookies", function($http, $cookies){
    $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];
}])

.run(["$rootScope", "$cacheFactory", function($rootScope, $cacheFactory){
}]);
