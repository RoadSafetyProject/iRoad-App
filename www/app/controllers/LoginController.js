/**
 * Created by joseph on 12/9/15.
 */
app.controller('LoginController',function($scope,$http,$localStorage,$location,$rootScope){

    //variables declaration
    $localStorage.url = $rootScope.configuration.url;
    $scope.loginForm = true;
    $rootScope.loadingData = false;
    $scope.loginUser = {};

    //set or close setting
    $scope.setOrCloseSetting = function(){

        $scope.loginForm = !$scope.loginForm;
    };

    //setting configurations
    $scope.setConfigurations = function () {

        $localStorage.url = $rootScope.configuration.url;
        $scope.setOrCloseSetting();
    };

    //function to login into the system
    $scope.login = function(){

        $scope.message = null;
        //checking for username and password has been entered
        if ($scope.loginUser.username && $scope.loginUser.password) {

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
                                    }
                                    iroad2.Init(dhisConfigs);

                                    //store data to local storage
                                    $localStorage.User = $rootScope.configuration.user;
                                    $localStorage.userData = loginUserData;

                                    $rootScope.userLogin = $rootScope.configuration.user;
                                    $rootScope.configuration.userData = loginUserData;

                                    //stop loading spinner as well as redirect to home page
                                    $location.path('/home');
                                    $rootScope.loadingData = false;
                                    $rootScope.$apply();
                                }
                                catch (e){

                                    Materialize.toast('Wrong Username or Password', 4000);
                                    $rootScope.loadingData = false;
                                    $scope.$apply();
                                }
                            },
                            failure : function(){

                                Materialize.toast('Please Check your network', 4000);
                                $rootScope.loadingData = false;
                                $rootScope.$apply();
                            }
                        });

                    },
                    failure : function() {

                        //fail to connect to the server
                        Materialize.toast('Fail to access server', 3000);
                        $rootScope.loadingData = false;
                        $rootScope.$apply();
                    }
                });
            }
            else{

                $scope.loginForm = !$scope.loginForm;
                $rootScope.loadingData = false;
                $rootScope.$apply();
            }
        }
        //empty submitted form
        else{

            //navigator.notification.vibrate();
            $location.path('/login');
            var message  = "Please enter password or username";
            Materialize.toast(message, 3000);
        }
    }

});