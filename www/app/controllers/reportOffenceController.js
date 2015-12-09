/**
 * Created by joseph on 12/9/15.
 */
app.controller('reportOffenceController',function($scope,$rootScope){

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
        if($rootScope.reportingForms.offence.newOffenseData['Vehicle Plate Number/Registration Number']){
            vehiclePlateNumber = $rootScope.reportingForms.offence.newOffenseData['Vehicle Plate Number/Registration Number'].toUpperCase();
            $rootScope.reportingForms.offence.newOffenseData['Vehicle Plate Number/Registration Number'] = vehiclePlateNumber;
            if(vehiclePlateNumber.length == 7){

                vehiclePlateNumber  =  vehiclePlateNumber.substr(0,4) + ' ' +vehiclePlateNumber.substr(4);
                $rootScope.reportingForms.offence.newOffenseData['Vehicle Plate Number/Registration Number'] = vehiclePlateNumber;
            }
        }


        if(!driverlicence){

            Materialize.toast('Enter Driver License Number',3000);
            message.push('Enter Driver License Number');
        }
        if(!vehiclePlateNumber){

            Materialize.toast('Enter Vehicle Plate Number/Registration Number',3000);
            message.push('Enter Vehicle Plate Number/Registration Number')
        }
        if(!($scope.offenseCount > 0)){

            Materialize.toast('Please select at least one offense',3000);
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

            $rootScope.loadingData = true;

            var driverModal =  new iroad2.data.Modal('Driver',[]);
            driverModal.get({value:driverlicence},function(driver){

                //checking if driver found
                if(driver.length <= 0){

                    Materialize.toast('Driver not found');
                    savingError.push('Driver Not found');
                    $scope.savingErrorMessages = savingError;
                    $rootScope.loadingData = false;
                    $rootScope.$apply();
                    $scope.$apply();
                }else{

                    $rootScope.reportingForms.offence.newOffenseData.Driver = driver[0];
                    var vehicleModal = new iroad2.data.Modal('Vehicle',[]);
                    vehicleModal.get({value:vehiclePlateNumber},function(vehicle){

                        //checking if vehicle not found
                        if(vehicle.length <= 0){

                            Materialize.toast('Vehicle Not found',3000);
                            savingError.push('Vehicle Not found');
                            $scope.savingErrorMessages = savingError;
                            $rootScope.loadingData = false;
                            $rootScope.$apply();
                            $scope.$apply();
                        }else{

                            $rootScope.reportingForms.offence.newOffenseData['Vehicle'] = vehicle[0];

                            $scope.savingErrorMessages = savingError;

                            var savingData = $rootScope.reportingForms.offence.newOffenseData;

                            var eventDate = null;
                            for(var key in savingData){
                                if($scope.isDate(key)){
                                    var d = new Date(savingData[key]);

                                    console.log('Month ' + d.getMonth());
                                    var date = d.getFullYear() + '-';
                                    if(d.getMonth() > 9){
                                        date = date + d.getMonth() + '-';
                                    }else{
                                        date = date + '0' + d.getMonth() + '-';
                                    }

                                    if(d.getDate() > 9){
                                        date = date + d.getDate();
                                    }else{
                                        date = date + '0' +d.getDate();
                                    }

                                    savingData[key] = date;
                                    eventDate = date;
                                }
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
                                var otherData = {orgUnit:$rootScope.configuration.userData.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:eventDate};
                                if($scope.geoPosition){
                                    otherData.coordinate = {
                                        "latitude": $scope.geoPosition.coords.latitude,
                                        "longitude": $scope.geoPosition.coords.longitude
                                    };
                                }else{
                                    otherData.coordinate = {"latitude": "","longitude": ""};
                                }


                                //saving reported offense
                                $scope.reporteOffense = savingData;
                                $scope.attetants = $rootScope.reportingForms.offence.attendant;
                                var offenceEventModal = new iroad2.data.Modal("Offence Event",[]);
                                offenceEventModal.save(savingData,otherData,function(result){

                                        if(result.httpStatus){
                                            var offenseSavingResponse = result.response;
                                            var offenseId = offenseSavingResponse.importSummaries[0].reference;

                                            $scope.reporteOffense.id = offenseId;

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
                                            offence.save(saveDataArray,otherData,function(){
                                                    $rootScope.loadingData = false;
                                                    $rootScope.$apply();

                                                },function(){
                                                    //error
                                                    Materialize.toast('Fail to save offense',3000);
                                                    $scope.savingErrorMessages.push('Fail to save offense');
                                                    $rootScope.loadingData = false;
                                                    $rootScope.$apply();
                                                    $scope.$apply();

                                                },
                                                offence.getModalName());

                                            //fetching police officer and update
                                            var policeModal = new iroad2.data.Modal('Police',[]);

                                            policeModal.get(new iroad2.data.SearchCriteria('Rank Number',"=",$scope.attetants),function(police){
                                                if(police.length > 0){
                                                    $scope.reporteOffense.Police = police[0];
                                                    offenceEventModal.save($scope.reporteOffense,otherData,
                                                        function(){

                                                            Materialize.toast('Success Reporting offense',3000);
                                                        },
                                                        function(){

                                                            Materialize.toast('Fail to update offense attendant',3000);
                                                        },
                                                        offenceEventModal.getModalName());
                                                }

                                            });//end of fetching Police*//*
                                            $rootScope.loadingData = false;
                                            $rootScope.$apply();
                                        }
                                    }
                                    ,function(){
                                        //error
                                        $scope.savingErrorMessages.push('Fail to save offense');
                                        Materialize.toast('Fail to save offense',3000);
                                        $rootScope.loadingData = false;
                                        $rootScope.$apply();
                                        $scope.$apply();
                                    },
                                    offenceEventModal.getModalName());
                                $rootScope.loadingData = false;
                                $rootScope.$apply();

                            }
                            else{

                                $rootScope.loadingData = false;
                                $rootScope.$apply();
                            }


                        }
                    });//end fo fetching vehicle information process
                }
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
});