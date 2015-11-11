var appControllers = angular.module('appControllers', ['appServices','multi-select',"ui.date"]);

//definition of functions
appControllers.controller('LoginController',LoginController);
appControllers.controller('HomeController', HomeController);
appControllers.controller('DriverVerificationController', DriverVerificationController);
appControllers.controller('VehicleVerificationController', VehicleVerificationController);

appControllers.controller('ReportAccidentsController', ReportAccidentsController);
appControllers.controller('ReportOffenceController', ReportOffenceController);
appControllers.controller('PaymentsController',PaymentsController);
appControllers.controller('DriverLicenceVerificationController',DriverLicenceVerificationController);
appControllers.controller('PaymentVerification',PaymentVerification);

//functions implementations


/*
*for control of all login logic for form submission to redirect to home page for success login user
 */
function LoginController($scope,$location,$rootScope){


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
		$scope.message = null;
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
						$scope.message  = "Fail to load server : " + $rootScope.configuration.url;
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
function HomeController($scope,$rootScope,$http){
	$rootScope.reportingForms = {
		'Accident' : {},
		'Offence' : {}
	};

	//function to empty data
	$scope.clearFormsFields = function(){
		if($rootScope.reportingForms.Accident || $rootScope.reportingForms.Offence){
			$rootScope.reportingForms.Accident = {};
			$rootScope.reportingForms.Offence = {};
		}

	}

	//function to handle profile for user
	$scope.viewProfile = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.userProfile = {'home': true};
	}

	//function to render home page
	$scope.home = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.successLogin = {'home': true};
	}

	//control report offence link on navigation
	$scope.reportOffence = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportOffense = {'home': true};
		$scope.prepareOffenseForms();

	}

	//function to prepare form for reporting offense
	$scope.prepareOffenseForms = function(){

		var offenseModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
		var modalName = offenseModal.getModalName();
		var event = {};
		angular.forEach(iroad2.data.programs, function (program) {
			if (program.name == modalName) {
				angular.forEach(program.programStages[0].programStageDataElements, function (dataElement) {
					if(dataElement.dataElement.name.startsWith(iroad2.config.refferencePrefix)){
						event[dataElement.dataElement.name.replace(iroad2.config.refferencePrefix,"")] = {};
					}else{
						event[dataElement.dataElement.name] = "";
					}

				});
			}
		});
		angular.forEach(offenseModal.getRelationships(), function (relationship) {
			if(relationship.pivot){
				event[relationship.pivot] = [];
			}
		});

		$rootScope.reportingForms.offence = {
			'dataElements' : event

		}

		$scope.editInputModal = [];
		angular.forEach($rootScope.dataOffense.registries, function (registry) {
			registry.selected = false;
			angular.forEach($rootScope.reportingForms.offence.Offence, function (off) {
				if(off.Offence_Registry.id == registry.id){
					registry.selected = true;
				}
			});
			$scope.editInputModal.push(registry);
		});

		$rootScope.reportingForms.offence = {
			'dataElements' : event,
			'editInput' : $scope.editInputModal,
			'newOffenseData' : {}

		}
	}



	//control driver verification view form
	$scope.verifyDriver = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyDriver = {'home': true};

		$rootScope.defaultPhotoID = null;
		var defaultPhotoUrl = $rootScope.configuration.url +'/api/documents.json?filter=name:eq:Default Driver Photo'
		$http({
			method : 'GET',
			url : defaultPhotoUrl
		}).success(function(response){

			if(response.documents.length != 0){
				$rootScope.defaultPhotoID = response.documents[0].id;
			}
		});
	}

	//control vehicle verification view form
	$scope.verifyVehicle = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyVehicle = {'home': true};
	}

	//control links for reporting accident form
	$scope.reportAccidents = function(){
		$scope.clearFormsFields();

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportAccidents = {'home': true,'basicInfo' : true};
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

		$rootScope.configuration.loadingData = false;

	}


	//function for setting configurations of the app
	$scope.settingConfigurations = function(){

		$rootScope.pageChanger = {}
		$rootScope.pageChanger.settingConfigurations = {'home': true}
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
	//variable for control hide and show more information r results
	$scope.moreInformationStatus = false;
	$scope.driverPhotoUrl = null;

	$scope.clearVehicleData = function(){
		$rootScope.verificationData.Vehicle.vehicle = {};
		$rootScope.verificationData.Vehicle.vehicleData = false;
		$rootScope.verificationData.Vehicle.error = '';
	}
	$scope.clearVehicleData();

	//function to verify driver based on given Licence number
	$scope.verifyDriver = function(){

		$scope.clearVehicleData();
		$scope.moreInformationStatus = false;

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

					//driver photo
					if($rootScope.verificationData.Driver.driver['Driver Photo']){

						$scope.driverPhotoUrl = $rootScope.configuration.url + '/api/documents/' + $rootScope.verificationData.Driver.driver['Driver Photo'] + '/data';
					}
					else{

						$scope.driverPhotoUrl = $rootScope.configuration.url + '/api/documents/' + $rootScope.defaultPhotoID + '/data';
					}
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
		$scope.moreInformationStatus = false;

		if($scope.data.vehilcePlateNumber){
			//enable loading
			$rootScope.configuration.loadingData = true;

			//get a vehicle using a given plate number
			var vehicleModal = new iroad2.data.Modal('Vehicle',[]);
			vehicleModal.get({value:$scope.data.vehilcePlateNumber},function(result){
				//checking if vehicle found
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

	//variable to show or hide more information or results
	$scope.moreInformationStatus = false;



}


/*
*Controller for all process during accident registration
*
 */
function ReportAccidentsController($scope,$rootScope){

	$scope.newAccidentBasicInfo = {};
	$scope.newAccidentBasicInfoOtherData = {}

	$scope.newAccidentVehicle = [];
	$scope.newAccidentWitness = [];

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
							'visibility' : true,
							'error' : ''
						}
					);
				}
				else{

					$scope.newAccidentVehicle.push({
							'vehicle': i,
							'dataElements' : $rootScope.reportingForms.Accident.accidentVehicle,
							'data' : {},
							'visibility' : false,
							'error' : ''
						}
					);
				}
			}

			$scope.vehicles = vehicleObject;

			//open form for accident vehicle
			$rootScope.pageChanger.reportAccidents.accidentVehicles = true;
		}else{

			$scope.verifyBasicInfo();
			$scope.setNumberOfVehicleWitnessMessage = 'Please Enter Number Of Vehicle(s)';
		}
	}

	/*
	*function to change to next vehicle
	 */
	$scope.nextVehicle = function(vehicle){

		$scope.newAccidentVehicleMessage ='';

		//set visibility for next vehicle
		if($scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'] && $scope.newAccidentVehicle[vehicle].data['Licence Number']){

			var licenceNumber = $scope.newAccidentVehicle[vehicle].data['Licence Number'];
			var plateNumber = $scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'];
			//fetching vehicle and driver before continues
			var driverModel =  new iroad2.data.Modal('Driver',[]);

			//loading message
			$rootScope.configuration.loadingData = true;

			driverModel.get({value:licenceNumber},function(driverList){
				if(driverList[0]){

					//fill data for driver object
					var driver = driverList[0]
					$scope.newAccidentVehicle[vehicle].data.Driver = {'id':driver['id']};
					$scope.newAccidentVehicle[vehicle].data['Full Name'] = driver['Full Name'];
					$scope.newAccidentVehicle[vehicle].data['Gender'] = driver['Gender'];
					$scope.newAccidentVehicle[vehicle].data['Date of Birth'] = driver['Date of Birth'];

					var vehicleModel = new iroad2.data.Modal('Vehicle',[]);
					vehicleModel.get({value:plateNumber},function(vehicleList) {
						if(vehicleList[0]){

							//fill other data from vehicle object
							var vehicleData = vehicleList[0];
							$scope.newAccidentVehicle[vehicle].data.Vehicle = {'id':vehicleData['id']};
							$scope.newAccidentVehicle[vehicle].data['Vehicle Ownership Category'] = vehicleData['Vehicle Ownership Category'];
							$scope.newAccidentVehicle[vehicle].data['Vehicle Class'] = vehicleData['Vehicle Class'];
							$scope.newAccidentVehicle[vehicle].data['Make'] = vehicleData['Make'];
							$scope.newAccidentVehicle[vehicle].data['Model'] = vehicleData['Model'];

							//continue with next part of form
							if($scope.newAccidentVehicle[vehicle].data.Vehicle && $scope.newAccidentVehicle[vehicle].data.Driver){

								$rootScope.configuration.loadingData = false;

								$scope.newAccidentVehicle[vehicle].error = '';
								if(vehicle == $scope.newAccidentBasicInfoOtherData.numberOfVehicle -1){
									//checking for witness form
									if($scope.newAccidentBasicInfoOtherData.numberOfWitness > 0){

										var witnessObjet = [];
										for(var i = 0; i < $scope.newAccidentBasicInfoOtherData.numberOfWitness; i ++){

											witnessObjet.push(i);
											if(i == 0){

												$scope.newAccidentWitness.push({
													'witness' : i,
													'dataElements' : $rootScope.reportingForms.Accident.accidentWitnes,
													'data' : {},
													'visibility' : true,
													'numberOfWitnesses' : $scope.newAccidentBasicInfoOtherData.numberOfWitness
												});
											}else{

												$scope.newAccidentWitness.push({
													'witness' : i,
													'dataElements' : $rootScope.reportingForms.Accident.accidentWitnes,
													'data' : {},
													'visibility' : false,
													'numberOfWitnesses' : $scope.newAccidentBasicInfoOtherData.numberOfWitness
												});
											}
										}
										$scope.witnesses = witnessObjet;
										witnessObjet = [];

										//hide accident vehicles forms
										$rootScope.pageChanger.reportAccidents.accidentVehicles = false;
										$rootScope.pageChanger.reportAccidents.accidentWitness = true;
									}else{

										//saving reported information
										$scope.saveAccident();
									}
								}else {

									$scope.newAccidentVehicle[vehicle].visibility = false;
									$scope.newAccidentVehicle[vehicle + 1].visibility = true;
								}
								$scope.$apply();
								$rootScope.$apply();
							}

						}
						else{

							$rootScope.configuration.loadingData = false;
							$scope.newAccidentVehicle[vehicle].error = 'Vehicle Plate Number/Registration Number ' + plateNumber + ' not found';
							$scope.newAccidentVehicle[vehicle].visibility = true;
							$scope.$apply();
							$rootScope.$apply();

						}

					});
				}
				else{

					$rootScope.configuration.loadingData = false;
					$scope.newAccidentVehicle[vehicle].error = 'Licence Number ' + licenceNumber + 'not Found';
					$scope.newAccidentVehicle[vehicle].visibility = true;
					$scope.$apply();
					$rootScope.$apply();
				}

			});//end fetching accident vehicle Drivers

		}else{

			$scope.newAccidentVehicleMessage ='Please Enter Vehicle Plate Number/Registration Number and Licence Number for Vehicle ' + (vehicle + 1);
		}

	}


	/*
	functions to handle all actions for witness forms

	 */
	$scope.nextWitness = function(witness){

		$scope.newAccidentWitnessMessage = '';

		//checking for first name, last name and phone number
		if($scope.newAccidentWitness[witness].data['First Name'] && $scope.newAccidentWitness[witness].data['Last Name'] && $scope.newAccidentWitness[witness].data['Phone Number']){

			if(witness == $scope.newAccidentBasicInfoOtherData.numberOfWitness - 1){

				//saving accident information
				$scope.saveAccident();
			}else{

				$scope.newAccidentWitness[witness].visibility = false;
				$scope.newAccidentWitness[witness + 1].visibility = true;
			}
		}else{

			$scope.newAccidentWitnessMessage = 'You must enter first name, last name and phone number of accident witness ' + (witness + 1);
		}

	}




	/*
	 function to save accident
	 fetching all drivers
	 fetching all vehicles
	 saving basic information for a given accident
	 saving accident witness
	 saving accident vehicle info
	 */
	$scope.saveAccident = function(){

		console.log('newAccidentBasicInfo' + JSON.stringify($scope.newAccidentBasicInfo));
		console.log('newAccidentVehicle' + JSON.stringify($scope.newAccidentVehicle));

		var witnessList = [];
		if($scope.newAccidentWitness){
			for(var i = 0; i < $scope.newAccidentWitness.length; i ++){
				if(($scope.newAccidentWitness[i].data)['First Name']){

					witnessList.push($scope.newAccidentWitness[i].data);
				}
			}
			console.log('newAccidentWitness List : ' + JSON.stringify(witnessList));
		}

		//other data
		var otherData = {orgUnit:$rootScope.configuration.userData.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:new Date()};
		if($scope.geoPosition){
			otherData.coordinate = {
				"latitude": $scope.geoPosition.coords.latitude,
				"longitude": $scope.geoPosition.coords.longitude
			};
		}else{
			otherData.coordinate = {"latitude": "","longitude": ""};
		}

		var accidentEventModal = new iroad2.data.Modal('Accident',[]);
		var savedAccidentBasicInfoEvent = $scope.newAccidentBasicInfo;
		console.log(JSON.stringify(savedAccidentBasicInfoEvent));
		//convert time and date
		for(var key in savedAccidentBasicInfoEvent){
			 if($scope.isDate(key)){
				 var d = new Date(savedAccidentBasicInfoEvent[key]);
				 var date = d.getFullYear() + '-'+d.getMonth() + '-' +d.getDate() + 'T00:00:00.430+0000';
				 savedAccidentBasicInfoEvent[key] = date;
			 }
		}

		console.log(JSON.stringify(savedAccidentBasicInfoEvent));

		accidentEventModal.save(savedAccidentBasicInfoEvent,otherData,function(result){

				console.log('accident basic info : ' + JSON.stringify(result))
				//checking if accident basic info have been reported
				if(result.response){

					result = result.response;
					savedAccidentBasicInfoEvent['id'] = result.importSummaries[0].reference;

					console.log('Saved Accident : ' + JSON.stringify(savedAccidentBasicInfoEvent));

					//saving accident Witness
					if(witnessList.length > 0){

						for(var i = 0;i< witnessList.length; i++){

							var witnessEvent = witnessList[i];
							witnessEvent.Accident = {'id' : savedAccidentBasicInfoEvent['id']};

							//convert time and date
							for(var key in witnessEvent){
								if($scope.isDate(key)){

									var d = new Date(witnessEvent[key]);
									var date = d.getFullYear() + '-'+d.getMonth() + '-' +d.getDate() + 'T00:00:00.430+0000';
									witnessEvent[key] = date
								}
							}

							console.log('witness : ' + JSON.stringify(witnessEvent));
							var accidentWitnessModel = new iroad2.data.Modal('Accident Witness',[]);
							accidentWitnessModel.save(witnessEvent,otherData,function(resultWitness){
								console.log('Success to add the witness to the accident' + JSON.stringify(resultWitness));

							},function(error){
								console.log('Fail to add the witness to the accident : ' + JSON.stringify(error));

							},accidentWitnessModel.getModalName());

						}
					}

					//saving accident vehicle
					for(var j = 0;j < $scope.newAccidentVehicle.length; j ++){

						var accidentVehicleEvent = $scope.newAccidentVehicle[j].data;
						accidentVehicleEvent.Accident = {'id' : savedAccidentBasicInfoEvent['id']};

						for(var key in accidentVehicleEvent){
							if($scope.isDate(key)){
								var d = new Date(accidentVehicleEvent[key]);
								var date = d.getFullYear() + '-'+d.getMonth() + '-' +d.getDate() + 'T00:00:00.430+0000';
								accidentVehicleEvent[key] = date
							}
						}

						console.log('accident vehicle : ' + JSON.stringify(accidentVehicleEvent));
						var driverModel =  new iroad2.data.Modal('Accident Vehicle',[]);
						driverModel.save(accidentVehicleEvent,otherData,function(resultAccidentVehicle){
							console.log('Success to add the accident vehicle' + JSON.stringify(resultAccidentVehicle));

						},function(error){
							console.log('Fail to add the accident vehicle : ' + JSON.stringify(error));

						},driverModel.getModalName());

					}

				}else{

					console.log('fail to reporting accident');
				}


			}
			,function(error){

				console.log('fails' + JSON.stringify(error));

			}
			,accidentEventModal.getModalName());



		/*$rootScope.pageChanger.reportAccidents.accidentWitness = false;
		$rootScope.pageChanger.reportAccidents.accidentVehicles = false;

		$rootScope.pageChanger.reportAccidents.save = true;
		$rootScope.configuration.loadingData = true;
*/
	};


	//get current location
	var onSuccess = function(position) {
		$rootScope.$apply(function() {
			$scope.geoPosition = position;
		});
	};
	var onError = function(error) {
		alert('ERROR! code: ' + error.code + ' ' + 'message: ' + error.message);
	};
	navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 10000, enableHighAccuracy: true});



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
		for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
			if(iroad2.data.dataElements[j].name == key){
				if(iroad2.data.dataElements[j].optionSet){
					return iroad2.data.dataElements[j].optionSet.options;
				}
			}
		};
		return false;
	}
}



/*
*controller for reporting offense
 */
function ReportOffenceController($scope,$rootScope){

	$scope.selected = null;

	$scope.selectOffense = function(dataList){
		var selectedOffenses = []
		angular.forEach(dataList,function(data){

			if(data.selected){
				selectedOffenses.push(data);
			}
		});
		$scope.selected = selectedOffenses

	};

	$scope.reportOffense = function(){
		$scope.selectOffense($rootScope.reportingForms.offence.editInput);

		var driverlicence = null;
		var vehiclePlateNumber = null;

		var message = [];
		$scope.errorMessagesForOffenseForm = null;

		//taking driver license number and vehicle plate number
		driverlicence = $rootScope.reportingForms.offence.newOffenseData['Driver License Number'];
		vehiclePlateNumber = $rootScope.reportingForms.offence.newOffenseData['Vehicle Plate Number/Registration Number'];

		if(!driverlicence){
			message.push('Enter Driver License Number');
		}
		if(!vehiclePlateNumber){
			message.push('Enter Vehicle Plate Number/Registration Number')
		}
		if(!($scope.offenseCount > 0)){
			message.push('Please select at least one offense');
		}

		$scope.errorMessagesForOffenseForm = message;



		/*
		*starting saving process
		* fetching driver
		* fetching vehicle
		* saving offense details
		* saving offense list
		 */
		$scope.savingErrorMessages = null;
		var savingError = [];
		if(!($scope.errorMessagesForOffenseForm.length > 0)){

			$rootScope.configuration.loadingData = true;

			var driverModal =  new iroad2.data.Modal('Driver',[]);
			driverModal.get({value:driverlicence},function(driver){

				//checking if driver found
				if(driver.length <= 0){

					savingError.push('Driver Not found');
				}else{

					$rootScope.reportingForms.offence.newOffenseData.Driver = {'id' : driver[0].id};
				}

				var vehicleModal = new iroad2.data.Modal('Vehicle',[]);
				vehicleModal.get({value:vehiclePlateNumber},function(vehicle){

					//checking if vehicle not found
					if(vehicle.length <= 0){

						savingError.push('Vehicle Not found');
					}else{

						$rootScope.reportingForms.offence.newOffenseData.Vehicle = {'id' : vehicle[0].id};
					}
					$scope.savingErrorMessages = savingError;
					var savingData = $rootScope.reportingForms.offence.newOffenseData;
					$scope.$apply();
					//fetching police officer
					var policeModal = new iroad2.data.Modal('Police',[]);
					policeModal.get(new iroad2.data.SearchCriteria('Rank Number',"=",$rootScope.reportingForms.offence.attendant),function(police){

						if(police.length > 0){
							savingData.Police = police[0];
						}
						//checking if driver and vehicle found
						if($scope.savingErrorMessages.length <= 0){

							$rootScope.pageChanger.reportOffense.saving = true;
							$rootScope.pageChanger.reportOffense.home = false;

							//add additional data to the offense reporting form

							if(savingData.Driver){

								savingData['Full Name'] = savingData.Driver['Full Name'];
								savingData['Gender'] = savingData.Driver['Gender'];
								savingData['Date of Birth'] = savingData.Driver['Date of Birth'];
							}
							if(savingData.Vehicle){

								savingData['Model'] = savingData.Vehicle['Model'];
								savingData['Make'] = savingData.Vehicle['Make'];
								savingData['Vehicle Class'] = savingData.Vehicle['Vehicle Class'];
								savingData['Vehicle Ownership Category'] =savingData.Vehicle['Vehicle Ownership Category'];
							}

							//other data
							var otherData = {orgUnit:$rootScope.configuration.userData.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:new Date()};
							if($scope.geoPosition){
								otherData.coordinate = {
									"latitude": $scope.geoPosition.coords.latitude,
									"longitude": $scope.geoPosition.coords.longitude
								};
							}else{
								otherData.coordinate = {"latitude": "","longitude": ""};
							}

							//saving reported offense
							var offenceEventModal = new iroad2.data.Modal("Offence Event",[new iroad2.data.Relation("Offence Registry","Offence")]);
							offenceEventModal.save(savingData,otherData,function(result){

									if(result.httpStatus){
										var offenseSavingResponse = result.response;
										var offenseId = offenseSavingResponse.importSummaries[0].reference;

										//prepare selected offense for saving
										var saveDataArray = [];
										angular.forEach($scope.selected,function(registry){
											var off = {
												"Offence_Event":{"id": offenseId},
												"Offence_Registry":{"id":registry.id}
											};
											saveDataArray.push(off);
										});
										var offence = new iroad2.data.Modal("Offence",[]);
										var count = 0;
										offence.save(saveDataArray,otherData,function(){

												$rootScope.configuration.loadingData = false;
												$rootScope.$apply();

											},function(){

												//error
												$scope.savingErrorMessages.push('Fail to save offense');
												$rootScope.configuration.loadingData = false;
												$rootScope.$apply();
												$scope.$apply();

											},
											offence.getModalName());
										$rootScope.configuration.loadingData = false;
										$rootScope.$apply();
									}
								}
								,function(){

									//error
									$scope.savingErrorMessages.push('Fail to save offense');
									$rootScope.configuration.loadingData = false;
									$rootScope.$apply();
									$scope.$apply();
								},
								offenceEventModal.getModalName());
							$rootScope.configuration.loadingData = false;
							$rootScope.$apply();

						}
						else{

							console.log('Error saving list : ' + JSON.stringify($scope.savingErrorMessages));
							$rootScope.configuration.loadingData = false;
							$rootScope.$apply();
						}



					});//end of fetching Police

				});//end fo fetching vehicle information process

			});//end of fetching driver information process


		}

	}

	$scope.offenseList = false;
	$scope.offenseCount = 0;
	$scope.addOffense = function(){
		$scope.offenseList = ! $scope.offenseList;
		$scope.selectOffense($rootScope.reportingForms.offence.editInput);
		if($scope.selected){
			$scope.offenseCount = $scope.selected.length;
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


//controller for payments
function PaymentsController($scope,$location,$rootScope){


}


function DriverLicenceVerificationController ($scope,$location) {




}


function PaymentVerification($scope){


}

