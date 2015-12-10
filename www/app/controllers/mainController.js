/**
 * Created by joseph on 12/9/15.
 */
app.controller('mainController',function($scope,$localStorage,$rootScope,$location){

    $rootScope.configuration = {
        'config': {},
        'url' : 'http://localhost:8080/demo'
        //'url':'http://roadsafety.go.tz/demo'
    };

    //loading data form local storage
    $rootScope.userLogin = $localStorage.User;
    var baseUrl = $localStorage.url;

    if($rootScope.userLogin && (baseUrl !=null)){

        $rootScope.configuration.userData = $localStorage.userData;
        login();
    }else{

        $rootScope.userLogin = null;
        $location.path('/login');
    }

    function login(){

        $scope.message = null;
        $scope.loginUser = $localStorage.User;
        //checking for username and password has been entered
        if ($scope.loginUser.username && $scope.loginUser.password) {

            Materialize.toast('checking user done',3000);
            var base = $localStorage.url;
            if(base){
                //enable loading notifications
                $rootScope.loadingData= true;

                Ext.Ajax.request({
                    url : base + '/dhis-web-commons-security/login.action?failed=false',
                    callbackKey : 'callback',
                    method : 'POST',
                    params : {
                        j_username : $scope.loginUser.username,
                        j_password : $scope.loginUser.password
                    },
                    withCredentials : true,
                    useDefaultXhrHeader : false,
                    success: function () {

                        Materialize.toast('success login request',3000);
                        //call checking if user is available
                        Ext.Ajax.request({
                            url: base + '/api/me.json',
                            callbackKey : 'callback',
                            method : 'GET',
                            params : {
                                j_username : $scope.loginUser.username,
                                j_password : $scope.loginUser.password
                            },
                            withCredentials : true,
                            useDefaultXhrHeader : false,
                            success : function(response){
                                Materialize.toast('success me.json',3000);
                                try{
                                    $rootScope.configuration.user = $scope.loginUser;
                                    var loginUserData = JSON.parse(response.responseText);
                                    $scope.loginUser = {};
                                    $scope.$apply();

                                    //loading library
                                    var dhisConfigs = {
                                        baseUrl: base + '/',
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
                                        Materialize.toast('loding Library',3000);
                                        console.log('iroad2' + JSON.stringify(iroad2))
                                    }
                                    iroad2.Init(dhisConfigs);

                                    //store data to local storage
                                    $localStorage.User = $rootScope.configuration.user;
                                    $localStorage.userData = loginUserData;

                                    //stop loading spinner as well as redirect to home page
                                    $location.path('/home');
                                    $rootScope.loadingData = false;
                                    $rootScope.$apply();
                                }
                                catch (e){

                                    Materialize.toast('Session has expired', 3000);
                                    $rootScope.loadingData = false;
                                    $rootScope.$apply();
                                    $location.path('/login');
                                }
                            },
                            failure : function(){

                                Materialize.toast('Session has expired', 3000);
                                $rootScope.loadingData = false;
                                $rootScope.$apply();
                                $location.path('/login');
                            }
                        });

                    },
                    failure : function() {

                        //fail to connect to the server
                        Materialize.toast('Session has expired', 3000);
                        $rootScope.loadingData = false;
                        $rootScope.$apply();
                        $location.path('/login');
                    }
                });
            }
            else{

                Materialize.toast('No base ',3000);
                //navigator.notification.vibrate();
                $location.path('/login');
                var message  = "Session has expired";
                Materialize.toast(message, 3000);
            }
        }
        //empty submitted form
        else{

            Materialize.toast('No login data',3000);
            //navigator.notification.vibrate();
            $location.path('/login');
            var message  = "Session has expired";
            Materialize.toast(message, 3000);
        }
    }

    function authenticateUser(base){


        $scope.loginUser = $localStorage.User;
        if(base){
            Ext.Ajax.request({
                url : base + '/dhis-web-commons-security/login.action',
                callbackKey : 'callback',
                method : 'POST',
                params : {
                    j_username : $scope.loginUser.username,
                    j_password : $scope.loginUser.password
                },
                withCredentials : true,
                useDefaultXhrHeader : false,
                success: function () {

                    alert('login call');
                    Ext.Ajax.request({
                        url: base + '/api/me.json',
                        callbackKey : 'callback',
                        method : 'GET',
                        params : {
                            j_username : $scope.loginUser.username,
                            j_password : $scope.loginUser.password
                        },
                        withCredentials : true,
                        useDefaultXhrHeader : false,
                        success : function(response){
                            try{
                                $rootScope.configuration.user = $scope.loginUser;
                                var loginUserData = JSON.parse(response.responseText);
                                $scope.loginUser = {};
                                $scope.$apply();

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
                                    alert('loading library')
                                }
                                iroad2.Init(dhisConfigs);

                                //store data to local storage
                                $localStorage.User = $rootScope.configuration.user;
                                $localStorage.userData = loginUserData;
                            }
                            catch (e){

                                Materialize.toast('Your session has expired', 4000);
                                $location.path('/login');
                            }
                        },
                        failure : function(){

                            Materialize.toast('Your session has expired', 4000);
                            $location.path('/login');
                        }
                    });

                },
                failure : function() {

                    Materialize.toast('Your session has expired', 4000);
                    $location.path('/login');
                }
            });
        }
        else{

            Materialize.toast('Your session has expired', 4000);
            $location.path('/login');
        }
    }

});
