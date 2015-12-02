/**
 * Created by joseph on 10/21/15.
 */
var app = angular.module('roadsafetyMobileApp', ['appControllers','ui.date','ngRoute','ngFileUpload']);
app.controller('mainController',function($scope,$rootScope,$http){
    //variables for the app
    $rootScope.configuration = {
        'user': {},
        'loadingData': false,
        'loginPage': false,
        'useData': {},
        'config': {},
        //'url' : 'http://localhost:8080/demo'
        'url':'http://roadsafety.go.tz/demo'
    };

    var url = $rootScope.configuration.url + '/api/me.json';
    $http.get(url,{})
        .then(function(reponse){
            var data = reponse.data;

            if(data.id){
                $rootScope.configuration.userData = data;
                $rootScope.configuration.loginPage = true;
                $rootScope.configuration.loadingData = false;
                $rootScope.pageChanger = {};
                $rootScope.pageChanger.successLogin = {'home' : true};

                //loading library
                var dhisConfigs = {
                    baseUrl: $rootScope.configuration.url + '/',
                    refferencePrefix: "Program_"
                };

                $rootScope.dataOffense = {};
                $scope.onInitialize = function(){
                    var registries = new iroad2.data.Modal("Offence Registry",[]);
                    registries.getAll(function(result){
                        $rootScope.dataOffense.registries = result;
                        $rootScope.$apply();
                    });
                }

                $rootScope.configuration.config = dhisConfigs;
                dhisConfigs.onLoad = function () {
                    $scope.onInitialize();
                }
                iroad2.Init(dhisConfigs);

            }

            console.log(JSON.stringify($rootScope.pageChanger));

        },function(error){

            console.log('error : ' + JSON.stringify(error));
            $rootScope.configuration.loginPage = false;
        }
    );

});


app.config(function($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'views/pages.html',
        controller: 'LoginController'
    })});




