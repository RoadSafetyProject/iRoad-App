/**
 * Created by joseph on 10/21/15.
 */
var app = angular.module('roadsafetyMobileApp', ['ui.date','ngRoute','ngFileUpload','ngMaterial','ngStorage'])
    .config(function($routeProvider,$localStorageProvider){
    $routeProvider
        .when('/home', {

            templateUrl: 'views/home/home.html',
            controller: 'navController'
        })
        .when('/login',{

            templateUrl: 'views/home/loginPage.html',
            controller: 'LoginController'
        })
        .when('/verify-driver',{

            templateUrl: 'views/verifications/driverVerification.html',
            controller: 'driverVerificationController'
        })
        .when('/verify-vehicle',{

            templateUrl: 'views/verifications/vehicleVerification.html',
            controller: 'vehicleVerificationController'
        })
        .when('/report-offense',{

            templateUrl: 'views/reportForms/reportOffense.html',
            controller: 'reportOffenceController'
        })
        .when('/report-accident',{

            templateUrl: 'views/reportForms/reportAccident.html',
            controller: 'reportAccidentsController'
        })
        .when('/profile',{

            templateUrl: 'views/home/userProfile.html'
        })
        .otherwise({
            redirectTo : '/login'
        });
});





