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
									$scope.$apply();

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
									$rootScope.pageChanger = {};
									$rootScope.pageChanger.successLogin = {'home' : true};
									$rootScope.$apply();
								}
								catch (e){
									$scope.message = "wrong password or username";
									$rootScope.configuration.loginPage = false;
									$rootScope.configuration.loadingData = false;
									$rootScope.$apply();
								}
							},
							failure : function(){
								$scope.message  = "Please Check your network";
								$rootScope.configuration.loadingData = false;
								$rootScope.$apply();
							}
						});

					},
					failure : function(response) {
						//fail to connect to the server
						console.log('Data : ' + JSON.stringify(response))
						$scope.message  = "Checking you network services";
						$rootScope.configuration.loadingData = false;
						$rootScope.$apply();
					}
				});
			}
			else{
				$scope.loginFormAvailability = !$scope.loginFormAvailability;
				$rootScope.configuration.loadingData = false;
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

	//function to empty data
	$scope.clearFormsFields = function(){
		$rootScope.reportingForms.Accident = {};
		$rootScope.reportingForms.Offence = {};
	}

	//function to handle profile for user
	$scope.viewProfile = function(){
		$scope.clearFormsFields();

		console.log('data : ' + JSON.stringify($rootScope.configuration.userData));
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.userProfile = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//function to render home page
	$scope.home = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.successLogin = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control report offence link on navigation
	$scope.reportOffence = function(){

		$rootScope.reportingForms = {
			'Accident' : {},
			'Offence' : {}
		};
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportOffense = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));

	}

	//control driver verification view form
	$scope.verifyDriver = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyDriver = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control vehicle verification view form
	$scope.verifyVehicle = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyVehicle = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control links for reporting accident form
	$scope.reportAccidents = function(){

		$rootScope.reportingForms = {
			'Accident' : {},
			'offence' : {}
		};
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportAccidents = {'home': true,'basicInfo' : true};
		console.log(JSON.stringify($rootScope.pageChanger));
		$scope.prepareAccidentForms();
	}

	//function to prepare accident forms for reporting
	$scope.prepareAccidentForms = function(){
		//enable loading data variable
		$rootScope.configuration.loadingData = true;

		//load basic information for accident
		var accidentModal = new iroad2.data.Modal('Accident',[]);
		var modalName = accidentModal.getModalName();
		var eventAccident = {};
		angular.forEach(iroad2.data.programs, function (program) {
			if (program.name == modalName) {
				angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
					if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
						//eventAccident[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
						var data = null;
					}else{
						eventAccident[dataElement.dataElement.name] = "";
					}
				});
			}
		});
		$rootScope.reportingForms.Accident.basicInfo = eventAccident;

		//loading accident vehicle form
		var accidentVehilce = new iroad2.data.Modal('Accident Vehicle',[]);
		var modalName = accidentVehilce.getModalName();
		var eventAccidentVehicle = {};
		angular.forEach(iroad2.data.programs, function (program) {
			if (program.name == modalName) {
				angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
					if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
						//eventAccidentVehicle[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
						var data = null;
					}else{
						eventAccidentVehicle[dataElement.dataElement.name] = "";
					}
				});
			}
		});
		$rootScope.reportingForms.Accident.accidentVehicle = eventAccidentVehicle;

		//loading accident passengers
		var accidentVehiclePassenger = new iroad2.data.Modal('Accident Passenger',[]);
		var modalName = accidentVehiclePassenger.getModalName();
		var eventAccidentVehiclePassenger = {};
		angular.forEach(iroad2.data.programs, function (program) {
			if (program.name == modalName) {
				angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
					if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
						//eventAccidentVehiclePassenger[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
						var data = null;
					}else{
						eventAccidentVehiclePassenger[dataElement.dataElement.name] = "";
					}
				});
			}
		});
		$rootScope.reportingForms.Accident.accidentVehiclePassenger = eventAccidentVehiclePassenger;

		//load accident witness form
		var accidentWitness = new iroad2.data.Modal('Accident Witness',[]);
		var modalName = accidentWitness.getModalName();
		var eventAccidentWitness = {};
		angular.forEach(iroad2.data.programs, function (program) {
			if (program.name == modalName) {
				//console.log('Program ' + JSON.stringify(program));
				angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
					if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
						//eventAccidentWitness[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
						var data = null;
					}else{
						eventAccidentWitness[dataElement.dataElement.name] = "";
					}
				});
			}
		});
		$rootScope.reportingForms.Accident.accidentWitnes = eventAccidentWitness;

		console.log('Accident forms : ' + JSON.stringify($rootScope.reportingForms.Accident));
		//disable loading progress
		$rootScope.configuration.loadingData = false;

	}


	//function for setting configurations of the app
	$scope.settingConfigurations = function(){

		$rootScope.pageChanger = {}
		$rootScope.pageChanger.settingConfigurations = {'home': true}
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//to loguot form the system
	$scope.logOut = function(){
		$scope.clearFormsFields();

		$rootScope.configuration.loadingData = true;
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
				$rootScope.configuration.loadingData = false;
				$rootScope.$apply()
			},
			failure : function(){
				$rootScope.configuration.loginPage = true;
				$rootScope.$apply();
				alert('fail to log out');
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


/*
*Controller for all process during accident registration
*
 */
function ReportAccidentsController($scope,$rootScope){

	$scope.newAccidentBasicInfo = {};
	$scope.newAccidentBasicInfoOtherData = {}

	$scope.newAccidentVehicle = [];

	//function to set visibility for area of accident sub-form and time
	$scope.areaLocation = function(){
		$rootScope.pageChanger.reportAccidents.basicInfo = false;
		$rootScope.pageChanger.reportAccidents.areaLocation = true;
		$rootScope.pageChanger.reportAccidents.otherBasicInfo = false;
		$rootScope.pageChanger.reportAccidents.setNumberOfVehicleWitness = false;
	}

	//function to set visibility of other parts for basic info for an accident
	$scope.otherBasicInfo = function(){

		$rootScope.pageChanger.reportAccidents.basicInfo = false;
		$rootScope.pageChanger.reportAccidents.areaLocation = false;
		$rootScope.pageChanger.reportAccidents.otherBasicInfo = true;
		$rootScope.pageChanger.reportAccidents.setNumberOfVehicleWitness = false;
	}

	//function to set number of vehicles and witness as well attendant
	$scope.setNumberOfVehicleWitness = function(){

		$rootScope.pageChanger.reportAccidents.basicInfo = false;
		$rootScope.pageChanger.reportAccidents.areaLocation = false;
		$rootScope.pageChanger.reportAccidents.otherBasicInfo = false;
		$rootScope.pageChanger.reportAccidents.setNumberOfVehicleWitness = true;
	}

	//function to show form for verification of basic information during accident registration
	$scope.verifyBasicInfo = function(){
		$rootScope.pageChanger.reportAccidents.basicInfo = true;
		$rootScope.pageChanger.reportAccidents.areaLocation = true;
		$rootScope.pageChanger.reportAccidents.otherBasicInfo = true;
		$rootScope.pageChanger.reportAccidents.setNumberOfVehicleWitness = true;
		$rootScope.pageChanger.reportAccidents.button = true;
		$scope.setNumberOfVehicleWitnessMessage = '';
	}


	/*
	*functions for accident vehicles
	 */

	$scope.accidentVehicleForm = function(){

		//close all forms for basic information
		$rootScope.pageChanger.reportAccidents.basicInfo = false;
		$rootScope.pageChanger.reportAccidents.areaLocation = false;
		$rootScope.pageChanger.reportAccidents.otherBasicInfo = false;

		if($scope.newAccidentBasicInfoOtherData.numberOfVehicle > 0){

			$rootScope.pageChanger.reportAccidents.setNumberOfVehicleWitness = false;
			//set array object of vehicles
			var vehicleObject = [];
			for(var i = 0; i < $scope.newAccidentBasicInfoOtherData.numberOfVehicle; i ++){
				vehicleObject.push(i);

				//add vehicle form
				if(i == 0){
					$scope.newAccidentVehicle.push({
							'vehicle': i,
							'dataElements' : $rootScope.reportingForms.Accident.accidentVehicle,
							'data' : {},
							'visibility' : true
						}
					);
				}
				else{
					$scope.newAccidentVehicle.push({
							'vehicle': i,
							'dataElements' : $rootScope.reportingForms.Accident.accidentVehicle,
							'data' : {},
							'visibility' : false
						}
					);
				}
			}

			$scope.vehicles = vehicleObject;

			//open form for accident vehicle
			$rootScope.pageChanger.reportAccidents.accidentVehicles = true;
		}else{
			$scope.verifyBasicInfo();
			$scope.setNumberOfVehicleWitnessMessage = 'Please Number Of Vehicle(s)';
		}
	}

	/*
	*function to change to next vehicle
	 */
	$scope.nextVehicle = function(vehicle){

		if(vehicle == $scope.newAccidentBasicInfoOtherData.numberOfVehicle -1){
			console.log('Ready for witness form')
		}else{
			//set visibility for next vehicle
			if($scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'] && $scope.newAccidentVehicle[vehicle].data['Licence Number']){
				$scope.newAccidentVehicle[vehicle].visibility = false;
				$scope.newAccidentVehicle[vehicle + 1].visibility = true;
			}else{
				$scope.newAccidentVehicleMessage ='Please Enter Vehicle Plate Number/Registration Number or Licence Number for Vehicle ' + (vehicle + 1);
			}

		}


	}



	/*
	*functions for flexible forms
	 */
	$scope.isInteger = function(key){
		return $scope.is(key,"int");
	}
	$scope.isDate = function(key){
		return $scope.is(key,"date");
	}
	$scope.isString = function(key){
		return $scope.is(key,"string");
	}

	$scope.is = function(key,dataType){
		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				if(iroad2.data.dataElements[j].type == dataType){
					return true;
				}
				break;
			}
		};
		return false;
	}
	$scope.isBoolean = function(key){
		return $scope.is(key,"bool");
	}
	$scope.hasDataSets = function(key){
		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				return (iroad2.data.dataElements[j].optionSet != undefined);

			}
		};
		return false;
	}
	$scope.getOptionSets = function(key){
		for(j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				if(iroad2.data.dataElements[j].optionSet){
					return iroad2.data.dataElements[j].optionSet.options;
				}
			}
		};
		return false;
	}
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

