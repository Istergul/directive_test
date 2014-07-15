'use strict';

var module = angular.module('app', [
    'ngCookies',
    'ngRoute',

    'app.directives',
    'app.controllers',
    'app.services'
])

.config(["$interpolateProvider", function($interpolateProvider){
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}])

.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
}])

.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';

    $httpProvider.interceptors.push('securityInterceptor');
}])

.config(["$routeProvider", function ($routeProvider) {
//.config(["$routeProvider", function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'static/src/partials/list.tpl.html',
            controller: "ListCtrl",
            resolve: {
                user: ['security', function(security) {
                    return security.requestCurrentUser();
                }]
            }
        })
        .when('/secpage', {
            templateUrl: 'static/src/partials/secpage.tpl.html',
            controller: "SecPageCtrl",
            resolve: ['$injector', function requireAuth($injector){
                var security = $injector.get('security');
                var q = $injector.get('$q');
                var securityRetryQueue = $injector.get('securityRetryQueue');
                var promise = security.requestCurrentUser();
                console.log(2)
                return promise.then(function(currentUser) {
                    if (currentUser) {
                        return currentUser;
                    } else {
                        return q.reject();
//                        return securityRetryQueue.pushRetryFn('unauthorized-client', requireAuth);
                    }
                });
            }]
        })
        .when('/add', {
            templateUrl: 'static/src/partials/add.tpl.html',
            controller: "AddCtrl",
            resolve: function() { }
        })
        .when('/:id', {
            templateUrl: 'static/src/partials/edit.tpl.html',
            controller: "EditCtrl",
            resolve: function() { }
        })
        .otherwise({redirectTo: '/'});
}])

.filter('newline2br', ['$sce', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input.replace(/\n/g, "<br>"));
    }
}])

.run(["$http", "$cookies", function($http, $cookies){
    $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];
}])

.run(["$rootScope", "$cacheFactory", function($rootScope, $cacheFactory){

    $rootScope.showError = function(ngModelController, error) {
        return ngModelController.$dirty && ngModelController.$error[error];
    };
    $rootScope.canSave = function(form) {
        return form.$dirty && form.$valid;
    };
    $rootScope.getItemWithLevel = function(item, level) {
        var i = 0, res = "";
        while (i < level) {
            res += " * ";
            i ++;
        }
        return res + item;
    };

    $rootScope.cache = $cacheFactory('cache');
}]);
'use strict';

angular.module('app.controllers', [])
.controller('MainCtrl', ["$scope", "$rootScope", "$http", "Tasks", "security",
        function($scope, $rootScope, $http, Tasks, security) {

    $scope.$watch(
        function() {return security.currentUser;},
        function(u){$scope.user = u;}
    );

    $scope.sendData = function() {
        var request = $http.get('/get-data');
    };
}])

.controller('ListCtrl', ["$scope", "$rootScope", "Tasks",
        function($scope, $rootScope, Tasks) {

    $scope.lastTaskId = $rootScope.cache.get('lastTaskId');
    $scope.tasks = Tasks.query();

    $scope.removeTask = function(obj) {
        Tasks.delete({'id': obj.id}, null).$promise.then(
            function() {
                $scope.tasks = Tasks.query();
            }
        );
    };
}])

.controller('AddCtrl', ["$scope", "$rootScope", "Tasks", function($scope, $rootScope, Tasks) {

    $scope.isAddedNewTask = false;
    $scope.task = {};
    $scope.serverError = null;

    $scope.addTask = function(obj) {
        Tasks.save(obj).$promise.then(
            function(o){
                $scope.task = angular.copy(o);
                $scope.isAddedNewTask = true;
                $scope.newTaskForm.$setPristine();
                $rootScope.cache.put('lastTaskId', o.id);
                $scope.newTask = {};
                $scope.serverError = null;
            },
            function(data) {
                $scope.serverError = data.data.detail;
            }
        );
    };

    $scope.tasks = Tasks.query();
}])

.controller('EditCtrl', ["$scope", "$rootScope", "Tasks", "$routeParams", function($scope, $rootScope, Tasks, $routeParams) {

    $scope.isUpdatedTask = false;
    $scope.editTask = Tasks.get({id: $routeParams.id});
    $scope.serverError = null;

    $scope.updateTask = function(obj) {
        Tasks.update({id: obj.id}, obj).$promise.then(
            function() {
                $scope.isUpdatedTask = true;
                $scope.updateTaskForm.$setPristine();
                $rootScope.cache.put('lastTaskId', obj.id);
                $scope.serverError = null;
            },
            function(data) {
                if (data.status == 500) {
                    $scope.serverError = data.data.detail;
                }
            }
        );
    };

    $scope.tasks = Tasks.query();
}])

.controller('LoginFormController', ['$scope', 'security', function($scope, security) {

    $scope.user = {};

    $scope.authError = null;

    $scope.authReason = null;
    if (security.getLoginReason()) {
        $scope.authReason = ( security.isAuthenticated() ) ?
            'login.reason.notAuthorized' :
            'login.reason.notAuthenticated';
    }

    // Attempt to authenticate the user specified in the form's model
    $scope.login = function () {
        // Clear any previous security errors
        $scope.authError = null;

        // Try to login
        security.login($scope.user.name, $scope.user.password).then(function (loggedIn) {
            if (!loggedIn) {
                // If we get here then the login failed due to bad credentials
                $scope.authError = 'login.error.invalidCredentials';
            }
        }, function (x) {
            // If we get here then there was a problem with the login request to the server
            $scope.authError = 'login.error.serverError';
        });
    };

    $scope.logout = function () {
        security.logout();
    };
}])

.controller('SecPageCtrl', ['$scope', 'security', function($scope, security) {

}])
;

'use strict';

angular.module('app.directives', [])

.directive('loginToolbar', ['security', function(security) {
    var directive = {
        templateUrl: 'static/src/partials/toolbar.tpl.html',
        restrict: 'E',
        replace: true,
        scope: true,
        link: function($scope, $element, $attrs, $controller) {
            $scope.isAuthenticated = security.isAuthenticated;
            $scope.login = security.showLogin;
            $scope.logout = security.logout;
            $scope.$watch(function() {
                return security.currentUser;
            }, function(currentUser) {
                console.log('watch', currentUser)
                $scope.currentUser = currentUser;
            });
        }
    };
    return directive;
}]);
'use strict';

angular.module('app.services', ['ngResource'])

.factory('Tasks', ['$resource', function($resource) {
    return $resource('/api/tasks/:id', null, {update: {method: "PUT"}});
}])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', '$q', function($injector, queue, $q) {
    return {
        "response": function (response) {
            console.log('response');
            return response;
        },
        'responseError': function(response) {
            console.log('####', response);
            if (response.status === 401) {
                var promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
                    console.log('&&&');
                    return $injector.get('$http')(response.config);
                });
                return promise;
            }
            return response;
        }
    };
}])

.factory('securityRetryQueue', ['$q', '$log', function($q, $log) {
    var retryQueue = [];

    var service = {
        onItemAddedCallbacks: [],
        hasMore: function() {
            return retryQueue.length > 0;
        },
        push: function(retryItem) {
            retryQueue.push(retryItem);
            // Call all the onItemAdded callbacks
            angular.forEach(service.onItemAddedCallbacks, function(cb) {
                try {
                    cb(retryItem);
                } catch(e) {
                    $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
                }
            });
        },
        pushRetryFn: function(reason, retryFn) {
            // The reason parameter is optional
            if (arguments.length === 1) {
                retryFn = reason;
                reason = undefined;
            }

            // The deferred object that will be resolved or rejected by calling retry or cancel
            var deferred = $q.defer();
            var retryItem = {
                reason: reason,
                retry: function() {
                    // Wrap the result of the retryFn into a promise if it is not already
                    $q.when(retryFn()).then(function(value) {
                        // If it was successful then resolve our deferred
                        deferred.resolve(value);
                    }, function(value) {
                        // Othewise reject it
                        deferred.reject(value);
                    });
                },
                cancel: function() {
                    // Give up on retrying and reject our deferred
                    deferred.reject();
                }
            };
            service.push(retryItem);
            return deferred.promise;
        },
        retryReason: function() {
            return service.hasMore() && retryQueue[0].reason;
        },
        cancelAll: function() {
            while(service.hasMore()) {
                retryQueue.shift().cancel();
            }
        },
        retryAll: function() {
            while(service.hasMore()) {
                retryQueue.shift().retry();
            }
        }
    };
    return service;
}])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', function($http, $q, $location, queue) {
    // Redirect to the given url (defaults to '/')
    function redirect(url) {
        url = url || '/';
        $location.path(url);
    }

    // Login form dialog stuff
    var loginDialog = null;
    function openLoginDialog() {
        console.log('open dialog');
//        if ( loginDialog ) {
//            throw new Error('Trying to open a dialog that is already open!');
//        }
//        loginDialog = $dialog.dialog();
//        loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
    }
    function closeLoginDialog(success) {
//        if (loginDialog) {
//            loginDialog.close(success);
//        }
        onLoginDialogClose(success);
    }
    function onLoginDialogClose(success) {
        loginDialog = null;
        if ( success ) {
            queue.retryAll();
        } else {
            queue.cancelAll();
            redirect();
        }
    }

    // Register a handler for when an item is added to the retry queue
    queue.onItemAddedCallbacks.push(function(retryItem) {
        if ( queue.hasMore() ) {
            service.showLogin();
        }
    });

    // The public API of the service
    var service = {

        // Get the first reason for needing a login
        getLoginReason: function () {
            return queue.retryReason();
        },

        // Show the modal login dialog
        showLogin: function() {
            openLoginDialog();
        },

        // Attempt to authenticate a user by the given email and password
        login: function(name, password) {
            var request = $http.post('/api-login', {name: name, password: password});
            return request.then(function(response) {
                console.log(response);
                service.currentUser = response.data.user;
                if (service.isAuthenticated()) {
                    closeLoginDialog(true);
                }
                return service.isAuthenticated();
            });
        },

        // Give up trying to login and clear the retry queue
        cancelLogin: function() {
            closeLoginDialog(false);
            redirect();
        },

        // Logout the current user and redirect
        logout: function(redirectTo) {
            $http.post('/api-logout').then(function() {
                console.log('logount');
                service.currentUser = null;
                redirect(redirectTo);
            });
        },

        // Ask the backend to see if a user is already authenticated - this may be from a previous session.
        requestCurrentUser: function() {
            //if ( service.isAuthenticated() ) {
            console.log(100);
            if ( service.currentUser ) {
                return $q.when(service.currentUser);
            } else {
                return $http.get('/current-user').then(function(response) {
                    service.currentUser = response.data.user;
                    console.log('resp', response.data);
                    return service.currentUser;
                });
            }
        },

        // Information about the current user
        currentUser: null,

        // Is the current user authenticated?
        isAuthenticated: function(){
            return service.currentUser;
        },

        // Is the current user an adminstrator?
        isAdmin: function() {
            return !!(service.currentUser && service.currentUser.admin);
        }
    };

    return service;
}])
;