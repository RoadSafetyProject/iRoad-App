var appControllers = angular.module('appControllers', ['appServices']);

//definition of functions
appControllers.controller('LoginController',LoginController);
appControllers.controller('HomeController', HomeController);
appControllers.controller('DriverVerificationController', DriverVerificationController);
appControllers.controller('VehicleVerificationController', VehicleVerificationController);

appControllers.controller('ReportAccidentsController', ReportAccidentsController);
appControllers.controller('ReportOffenceHomeController', ReportOffenceHomeController);
appControllers.controller('ReportOffenceController', ReportOffenceController);
appControllers.controller('PaymentsController',PaymentsController);
appControllers.controller('DriverLicenceVerificationController',DriverLicenceVerificationController);
appControllers.controller('PaymentVerification',PaymentVerification);

//functions implementations


/*
*for control of all login logic for form submission to redirect to home page for success login user
 */
function LoginController($scope,$location,$rootScope){
	//variables for the app
	$rootScope.configuration = {
		'user': {},
		'loadingData': false,
		'loginPage': false,
		'useData': {},
		'config': {},
		'url' : 'http://localhost:8080/demo'
		//'url':'http://roadsafety.go.tz/demo'
	};

	$rootScope.pageChanger = {
		'reportOffense': {},
		'reportAccident': {},
		'payments': {},
		'verifyDriver' : {},
		'verifyVehicle' : {}
	};
	$scope.loginUser = {};
	$scope.loginFormAvailability = true;
	$scope.loginPage = false;

	//function to set setting for app for debug process
	$scope.setSetting = function () {
		$scope.loginFormAvailability = !$scope.loginFormAvailability;
	}
	//function to close set up for setting
	$scope.closeSetSetting = function () {
		$scope.loginFormAvailability = !$scope.loginFormAvailability;
	}

	//setting configurations
	$scope.setConfigurations = function () {
		$rootScope.configuration.url = $rootScope.configuration.url;
		$scope.closeSetSetting();
	}

	$scope.login = function(){
		//checking for username and password has been entered
		if ($scope.loginUser.username && $scope.loginUser.password) {
			$rootScope.configuration.user = $scope.loginUser;
			var base = $rootScope.configuration.url;
			if(base){
				//enable loading notifications
				$rootScope.configuration.loadingData = true;

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
					success: function (data) {
						console.log('Data : ' + JSON.stringify('success, ready for checking user'));
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

									//loading library
									var dhisConfigs = {
										baseUrl: $rootScope.configuration.url + '/',
										refferencePrefix: "Program_"
									};

									$rootScope.configuration.config = dhisConfigs;
									dhisConfigs.onLoad = function () {
										console.log('success loading library');
									}
									iroad2.Init(dhisConfigs);
									$rootScope.configuration.userData = loginUserData;
									$rootScope.configuration.loginPage = true;
									$rootScope.configuration.loadingData = false;
									$rootScope.pageChanger.successLogin = {'home' : true};
									$rootScope.$apply();
								}
								catch (e){
									$scope.message = "wrong password or username";
									$rootScope.configuration.loginPage = false;
									$rootScope.$apply();
								}
							}
						});

					},
					failure : function(response) {
						//fail to connect to the server
						console.log('Data : ' + JSON.stringify(response))
						$scope.message  = "Checking you network services";
					}
				});
			}
			else{
				$scope.loginFormAvailability = !$scope.loginFormAvailability;
			}

		}
		//empty submitted form		
		else{

			$location.path('/');
			$scope.message  = "Please enter password or username";

		};
	}

}


/*
*for control all navigation actions to render a given page
 */
function HomeController($scope,$rootScope){

	//control report offence link on navigation
	$scope.reportOffence = function(){

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportOffense = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));

	}

	//control driver verification view form
	$scope.verifyDriver = function(){
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyDriver = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control vehicle verification view form
	$scope.verifyVehicle = function(){
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyVehicle = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control links for reporting accident form
	$scope.reportAccidents = function(){

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportAccidents = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//to loguot form the system
	$scope.logOut = function(){
		var base = $rootScope.configuration.url;
		Ext.Ajax.request({
			url: base + '/dhis-web-commons-security/logout.action',
			callbackKey: 'callback',
			method: 'GET',
			params: {
				j_username: $rootScope.configuration.user.username,
				j_password: $rootScope.configuration.user.password
			},
			withCredentials: true,
			useDefaultXhrHeader: false,
			success: function () {
				$scope.message = "Success log out ";
				$scope.$apply();
				$rootScope.configuration.loginPage = false;
				$rootScope.$apply()
			}
		});
	}
}


/*
*for control all function for verification of driver
 */
function DriverVerificationController($scope,$rootScope){

	//prepare variables
	$rootScope.verificationData= {
		'Driver':{
			'driverData' : false,
			'driver' : {},
			'error' : ''
		},
		'Vehicle':{
			'vehicleData' : false,
			'vehicle' : {},
			'error' : ''
		}
	};
	$scope.data = {};

	$scope.clearVehicleData = function(){
		$rootScope.verificationData.Vehicle.vehicle = {};
		$rootScope.verificationData.Vehicle.vehicleData = false;
		$rootScope.verificationData.Vehicle.error = '';
	}
	$scope.clearVehicleData();

	//function to verify driver based on given Licence number
	$scope.verifyDriver = function(){

		$scope.clearVehicleData();

		if($scope.data.driverLicenceNumber){

			//enable loading
			$rootScope.configuration.loadingData = true;

			//fetching driver from system
			var driverModal =  new iroad2.data.Modal('Driver',[]);
			driverModal.get({value:$scope.data.driverLicenceNumber},function(result){
				//checking id driver found
				if(result.length > 0){
					$rootScope.verificationData.Driver.driverData = true;
					$rootScope.verificationData.Driver.driver = result[0];
					$rootScope.configuration.loadingData = false;
				}
				else{
					$rootScope.verificationData.Driver.driverData = false;
					$rootScope.verificationData.Driver.error = "Driver Not Found";
					$rootScope.configuration.loadingData = false;
				}
				$rootScope.$apply();
			});

		}
		else{
			$rootScope.verificationData.Driver.error = 'Please Enter Driver Licence number to verify';
		}
	}
}


/*
*Controller for verification of vehicles
*
 */
function VehicleVerificationController($scope,$rootScope){

	//prepare variables
	$rootScope.verificationData= {
		'Driver':{
			'driverData' : false,
			'driver' : {},
			'error' : ''
		},
		'Vehicle':{
			'vehicleData' : false,
			'vehicle' : {},
			'error' : ''
		}
	};
	$scope.data = {}

	$scope.cleanDriverData = function(){
		$rootScope.verificationData.Driver.driverData = false;
		$rootScope.verificationData.Driver.driver = {};
		$rootScope.verificationData.Driver.error = '';
	}

	$scope.cleanDriverData();

	//function to verify vehicle based on given vehicle plate number
	$scope.verifyVehicle = function () {
		$scope.cleanDriverData();

		if($scope.data.vehilcePlateNumber){
			//enable loading
			$rootScope.configuration.loadingData = true;

			//get a vehicle using a given plate number
			var vehicleModal = new iroad2.data.Modal('Vehicle',[]);
			vehicleModal.get({value:$scope.data.vehilcePlateNumber},function(result){
				//checking if vehicle found
				console.log('vehicle : ' + JSON.stringify(result));
				if(result.length > 0){
					$rootScope.verificationData.Vehicle.vehicle = result[0];
					$rootScope.verificationData.Vehicle.vehicleData = true;
					$rootScope.configuration.loadingData = false;
				}
				else{
					$rootScope.verificationData.Vehicle.error = 'Vehicle Not Found';
					$rootScope.verificationData.Vehicle.vehicleData = false;
					$rootScope.configuration.loadingData = false;
				}
				$rootScope.$apply();
			});

		}
		else{
			$rootScope.verificationData.Vehicle.error = 'Please Enter Vehicle Plate Number/Registration Number to Verify a vehicle';
		}
	}


}


function ReportAccidentsController($scope,$rootScope){


}


function ReportOffenceHomeController($scope,$location,$rootScope){


}


function ReportOffenceController($scope,$rootScope){


}


//controller for payments
function PaymentsController($scope,$location,$rootScope){


}


function DriverLicenceVerificationController ($scope,$location) {




}


function PaymentVerification($scope){


}

