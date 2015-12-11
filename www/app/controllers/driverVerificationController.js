/**
 * Created by joseph on 12/9/15.
 */
app.controller('driverVerificationController',function($scope,$rootScope){

    //prepare variables
    $rootScope.verificationData= {
        'Driver':{
            'driverData' : false,
            'driver' : {}
        },
        'Vehicle':{
            'vehicleData' : false,
            'vehicle' : {}
        }
    };
    $scope.rapSheetStatus = false;
    $scope.accidentHistory = false;
    $scope.offenseHistory = false;
    $scope.data = {};
    //variable for control hide and show more information r results
    $scope.moreInformationStatus = false;
    $scope.driverPhotoUrl = null;

    $scope.clearVehicleData = function(){
        $rootScope.verificationData.Vehicle.vehicle = {};
        $rootScope.verificationData.Vehicle.vehicleData = false;
        $rootScope.verificationData.Vehicle.error = '';
        $rootScope.verificationData.Vehicle.accidentData = null;
        $rootScope.verificationData.Vehicle.offenceData = null;
    };
    $scope.clearVehicleData();

    $scope.hideOrShowRapSheet = function(){

        $scope.rapSheetStatus = !$scope.rapSheetStatus;
        $scope.accidentHistory = false;
        $scope.offenseHistory = false;
    };
    $scope.hideOrShowAccidentHistory = function(){

        $scope.accidentHistory = !$scope.accidentHistory;
        $scope.offenseHistory = false;
    };
    $scope.hideOrShowOffenseHistory = function(){

        $scope.offenseHistory = !$scope.offenseHistory;
        $scope.accidentHistory = false;
    };

    $scope.scanDriverLicence = function(){

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if(!result.cancelled){
                    Materialize.toast('Scan driver license completed');
                    $scope.data.driverLicenceNumber = result.text;
                    $scope.$apply();
                    $scope.verifyDriver();
                }
            },
            function () {

                Materialize.toast('Fail to scan driver license');
            }
        );
    };

    //function to verify driver based on given Licence number
    $scope.verifyDriver = function(){

        $scope.rapSheetStatus = false;
        $scope.accidentHistory = false;
        $scope.offenseHistory = false;

        $scope.clearVehicleData();
        $scope.moreInformationStatus = false;

        if($scope.data.driverLicenceNumber){

            //enable loading
            $rootScope.loadingData = true;

            //fetching driver from system
            var driverModal =  new iroad2.data.Modal('Driver',[]);
            var licenceNumber = $scope.data.driverLicenceNumber;
            driverModal.get({'value':licenceNumber},function(result){
                //checking id driver found
                if(result.length > 0){
                    $rootScope.verificationData.Driver.driverData = true;
                    $rootScope.verificationData.Driver.driver = result[0];
                    $rootScope.loadingData = false;

                    //driver photo
                    if($rootScope.verificationData.Driver.driver['Driver Photo']){

                        $scope.driverPhotoUrl = $rootScope.configuration.url + '/api/documents/' + $rootScope.verificationData.Driver.driver['Driver Photo'] + '/data';
                    }
                    else{

                        $scope.driverPhotoUrl = $rootScope.configuration.url + '/api/documents/' + $rootScope.defaultPhotoID + '/data';
                    }
                    $rootScope.$apply();

                    //fetching accidents
                    var accidentModal = new  iroad2.data.Modal('Accident Vehicle',[]);
                    var accidents = [];
                    accidentModal.get(new iroad2.data.SearchCriteria('Licence Number',"=",licenceNumber),function(accidentResults){

                        for(var i = 0; i < accidentResults.length; i++){
                            var data = accidentResults[i];
                            if(!(JSON.stringify(data.Accident) === '{}' )){
                                accidents.push(data);
                            }
                        }
                        $rootScope.verificationData.Driver.accidentData = accidents;
                        $rootScope.$apply();

                        //fetching offenses  $rootScope.verificationData.Driver.offenceData
                        var offenseModal = new  iroad2.data.Modal('Offence Event',[]);
                        var offenses = [];
                        offenseModal.get(new iroad2.data.SearchCriteria('Driver License Number',"=",licenceNumber),function(offensesResults){

                            console.log('offenses : ' + JSON.stringify(offensesResults));
                            $rootScope.verificationData.Driver.offenceData = offensesResults;
                            /*for(var i = 0; i < accidentResults.length; i++){
                             var data = accidentResults[i];
                             if(!(JSON.stringify(data.Accident) === '{}' )){
                             accidents.push(data);
                             }
                             }
                             $rootScope.verificationData.Driver.accidentData = accidents;*/
                            $rootScope.$apply();
                        });

                    });


                }
                else{
                    $rootScope.verificationData.Driver.driverData = false;
                    $rootScope.loadingData = false;
                    Materialize.toast("Driver Not Found",3000);
                }
                $rootScope.$apply();
            });

        }
        else{

            Materialize.toast('Please Enter Driver Licence number',3000);
        }
    }
});