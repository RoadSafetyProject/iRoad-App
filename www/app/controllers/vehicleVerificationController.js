/**
 * Created by joseph on 12/9/15.
 */
app.controller('vehicleVerificationController',function($scope,$rootScope){

    //variable to show or hide more information or results
    $scope.moreInformationStatus = false;
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
    $scope.data = {}

    $scope.cleanDriverData = function(){
        $rootScope.verificationData.Driver.driverData = false;
        $rootScope.verificationData.Driver.driver = {};
        $rootScope.verificationData.Driver.error = '';
        $rootScope.verificationData.Driver.accidentData = null;
        $rootScope.verificationData.Driver.offenceData = null;
    }

    $scope.cleanDriverData();

    $scope.hideOrShowRapSheet = function(){

        $scope.rapSheetStatus = !$scope.rapSheetStatus;
        $scope.accidentHistory = false;
        $scope.offenseHistory = false;
    }
    $scope.hideOrShowAccidentHistory = function(){

        $scope.accidentHistory = !$scope.accidentHistory;
        $scope.offenseHistory = false;
    }
    $scope.hideOrShowOffenseHistory = function(){

        $scope.offenseHistory = !$scope.offenseHistory;
        $scope.accidentHistory = false;
    }

    //function to verify vehicle based on given vehicle plate number
    $scope.verifyVehicle = function () {

        $scope.rapSheetStatus = false;
        $scope.accidentHistory = false;
        $scope.offenseHistory = false;

        $scope.cleanDriverData();
        $scope.moreInformationStatus = false;

        if($scope.data.vehilcePlateNumber){
            //enable loading
            $rootScope.loadingData = true;

            //get a vehicle using a given plate number
            var vehicleModal = new iroad2.data.Modal('Vehicle',[]);

            //prepare plate number for seearching
            if($scope.data.vehilcePlateNumber){
                var plateNumber = $scope.data.vehilcePlateNumber.toUpperCase();
            }
            if(plateNumber.length == 7){

                plateNumber  =  plateNumber.substr(0,4) + ' ' +plateNumber.substr(4);
            }


            vehicleModal.get({value:plateNumber},function(result){
                //checking if vehicle found
                if(result.length > 0){
                    $rootScope.verificationData.Vehicle.vehicle = result[0];
                    $rootScope.verificationData.Vehicle.vehicleData = true;
                    $rootScope.loadingData = false;
                    $rootScope.$apply();

                    //fetching accidents
                    var accidentModal = new  iroad2.data.Modal('Accident Vehicle',[]);
                    var accidents = [];
                    accidentModal.get(new iroad2.data.SearchCriteria('Vehicle Plate Number/Registration Number',"=",plateNumber),function(accidentResults){

                        for(var i = 0; i < accidentResults.length; i++){
                            var data = accidentResults[i];
                            if(!(JSON.stringify(data.Accident) === '{}' )){
                                accidents.push(data);
                            }
                        }
                        $rootScope.verificationData.Vehicle.accidentData = accidents;
                        $rootScope.$apply();

                        //fetching offenses  $rootScope.verificationData.Driver.offenceData
                        var offenseModal = new  iroad2.data.Modal('Offence Event',[]);
                        var offenses = [];
                        offenseModal.get(new iroad2.data.SearchCriteria('Vehicle Plate Number/Registration Number',"=",plateNumber),function(offensesResults){

                            $rootScope.verificationData.Vehicle.offenceData = offensesResults;
                            $rootScope.$apply();
                        });


                    });

                }
                else{

                    $rootScope.verificationData.Vehicle.vehicleData = false;
                    $rootScope.loadingData = false;
                    Materialize.toast('Vehicle Not Found',3000);
                }
                $rootScope.$apply();
            });

        }
        else{

            Materialize.toast('Please Enter Vehicle Plate Number',3000);
        }
    }
});