/**
 * Created by joseph on 10/21/15.
 */
var app = angular.module('roadsafetyMobileApp', ['appControllers','ui.date']);


app.config(function($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'views/pages.html',
        controller: 'LoginController'
    })
        .otherwise({redirectTo : '/' })});


