/**
 * Created by joseph on 12/9/15.
 */
app.controller('mainController',function($scope,$localStorage,$rootScope,$location){

    //loading data form local storage
    $rootScope.userLogin = $localStorage.User;
    var baseUrl = $localStorage.url;

    if(baseUrl){
        $rootScope.configuration = {
            'config': {},
            'url' : baseUrl
        };
    }
    else{
        $rootScope.configuration = {
            'config': {},
            //'url' : 'http://localhost:8080/demo'
            'url':'http://roadsafety.go.tz/demo'
        };
    }

    if($rootScope.userLogin && (baseUrl !=null)){

        $rootScope.configuration.userData = $localStorage.userData;
        $rootScope.userLogin = null;
        Materialize.toast('Reload data',2000);
        $location.path('/reload');
        login();
    }else{

        $rootScope.userLogin = null;
        $location.path('/login');
    }

    function login(){

        $scope.message = null;
        $rootScope.userLogin = $localStorage.User;
        $scope.loginUser = $localStorage.User;
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
                                        Materialize.toast('Success Reload data',3000);
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
                                $rootScope.userLogin = null;
                                $rootScope.loadingData = false;
                                $rootScope.$apply();
                                $location.path('/login');
                            }
                        });

                    },
                    failure : function() {

                        //fail to connect to the server
                        Materialize.toast('Session has expired', 3000);
                        $rootScope.userLogin = null;
                        $rootScope.loadingData = false;
                        $rootScope.$apply();
                        $location.path('/login');
                    }
                });
            }
            else{

                Materialize.toast('No base ',3000);
                //navigator.notification.vibrate();
                $rootScope.userLogin = null;
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
            $rootScope.userLogin = null;
            var message  = "Session has expired";
            Materialize.toast(message, 3000);
        }
    }

});
