/**
 * Created by joseph on 10/21/15.
 */
var app = angular.module('roadsafetyMobileApp', ['ui.date','ngRoute','ngFileUpload']);

app.config(function($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'views/pages.html',
        controller: 'LoginController'
    })});




