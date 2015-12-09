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
        $location.path('/home');
        authenticateUser(baseUrl);
    }else{

        $rootScope.userLogin = null;
        $location.path('/login');
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
