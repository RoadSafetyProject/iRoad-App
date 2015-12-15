/**
 * Created by joseph on 12/9/15.
 */
app.controller('navController',function($scope,$rootScope,$localStorage,$location,$http){

    $rootScope.reportingForms = {
        'Accident' : {},
        'Offence' : {}
    };

    //function to empty data
    $scope.clearFormsFields = function(){
        if($rootScope.reportingForms.Accident || $rootScope.reportingForms.Offence){
            $rootScope.reportingForms.Accident = {};
            $rootScope.reportingForms.Offence = {};
            $rootScope.loadingData = false;
        }

    };

    //function to handle profile for user
    $scope.viewProfile = function(){

        $scope.clearFormsFields();
        $location.path('/profile');
    };

    //function to render home page
    $scope.home = function(){

        $scope.clearFormsFields();
        $location.path('/home');
    };

    //control report offence link on navigation
    $scope.reportOffence = function(){

        $scope.clearFormsFields();
        $scope.prepareOffenseForms();
        $rootScope.pageChanger = {};
        $rootScope.pageChanger.reportOffense = {'home': true};
        $location.path('/report-offense');
    };

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
        $scope.editInputModal = [];

        $rootScope.reportingForms.offence = {
            'dataElements' : event,
            'editInput' : $scope.editInputModal,
            'newOffenseData' : {
                'Vehicle' : {},
                'Driver' : {}
            }

        };

        angular.forEach($rootScope.dataOffense.registries, function (registry) {
            registry.selected = false;
            angular.forEach($rootScope.reportingForms.offence.Offence, function (off) {
                if(off.Offence_Registry.id == registry.id){
                    registry.selected = true;
                }
            });
            $scope.editInputModal.push(registry);
        });
    };

    //control driver verification view form
    $scope.verifyDriver = function(){
        $scope.clearFormsFields();

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

        $rootScope.pageChanger = {};
        $rootScope.pageChanger.verifyDriver = {'home': true};
        $location.path('/verify-driver');
    };

    //control vehicle verification view form
    $scope.verifyVehicle = function(){

        $scope.clearFormsFields();
        $rootScope.pageChanger = {};
        $rootScope.pageChanger.verifyVehicle = {'home': true};
        $location.path('/verify-vehicle');
    };

    //control links for reporting accident form
    $scope.reportAccidents = function(){

        $scope.clearFormsFields();
        $scope.prepareAccidentForms();
        $location.path('/report-accident');
    };

    //function to prepare accident forms for reporting
    $scope.prepareAccidentForms = function(){
        //enable loading data variable
        $rootScope.loadingData = true;

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

        $rootScope.loadingData = false;
        $rootScope.pageChanger = {};
        $rootScope.pageChanger.reportAccidents = {'home': true,'captureMedia' : true};
    }

    //to loguot form the system
    $scope.logOut = function(){
        $scope.clearFormsFields();

        $rootScope.loadingData = true;
        var base = $localStorage.url;
        Ext.Ajax.request({
            url: base + '/dhis-web-commons-security/logout.action',
            callbackKey: 'callback',
            method: 'GET',
            params: {
                j_username: $localStorage.User.username,
                j_password: $localStorage.User.password
            },
            withCredentials: true,
            useDefaultXhrHeader: false,
            success: function () {
                var message = "Success log out ";
                Materialize.toast(message,3000);
                $rootScope.loadingData = false;
                $rootScope.$apply()
                $localStorage.$reset();
                $rootScope.userLogin = null;
                $rootScope.$apply();
                $location.path('/login');
            },
            failure : function(){

                Materialize.toast('Fail to log out',3000);
            }

        });
    }

});
