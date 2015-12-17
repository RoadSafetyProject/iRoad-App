/**
 * Created by joseph on 12/9/15.
 */
app.controller('reportOffenceController',function($scope,$rootScope,$location){

    $scope.selected = null;

    $scope.selectOffense = function(dataList){
        var selectedOffenses = []
        angular.forEach(dataList,function(data){

            if(data.selected){
                selectedOffenses.push(data);
            }
        });
        $scope.selected = selectedOffenses

        var amountTotal = 0;
        selectedOffenses.forEach(function(selectedOffense){

            amountTotal += parseInt(selectedOffense.Amount);
        });
        $rootScope.reportingForms.offence.reprtedOffenses = {
            list : selectedOffenses,
            amountTotal : amountTotal,
            offense : {}
        };

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

                            for(var key in $rootScope.reportingForms.offence.newOffenseData){
                                if($scope.isDate(key)){
                                    var m,d = (new Date($rootScope.reportingForms.offence.newOffenseData[key]));
                                    m = d.getMonth() + 1;
                                    console.log('key : ' + m);
                                    var date = d.getFullYear() + '-';
                                    if(m > 9){
                                        date = date + m + '-';
                                    }else{
                                        date = date + '0' + m + '-';
                                    }

                                    if(d.getDate() > 9){
                                        date = date + d.getDate();
                                    }else{
                                        date = date + '0' +d.getDate();
                                    }

                                    savingData[key] = date;
                                    console.log(' date date : ' +  savingData[key]);
                                }
                            }

                            //checking if driver and vehicle found
                            if($scope.savingErrorMessages.length <= 0){

                                $rootScope.pageChanger.reportOffense.saveConfirmation = true;
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

                                //saving reported offense
                                $rootScope.reportingForms.offence.reprtedOffenses.data = savingData;
                                console.log('Offense list : ' + JSON.stringify($scope.selected))
                                $rootScope.reportingForms.offence.reprtedOffenses.selectedOffenses = $scope.selected;
                                $scope.attetants = $rootScope.reportingForms.offence.attendant;


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
    /*$scope.isInteger = function(key){
        return $scope.is(key,"int");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"date");
    }
    $scope.isString = function(key){
        return $scope.is(key,"string");
    }*/

    $scope.isInteger = function(key){
        return $scope.is(key,"NUMBER");
    }
    $scope.isDate = function(key){
        return $scope.is(key,"DATE");
    }
    $scope.isString = function(key){
        return $scope.is(key,"TEXT");
    }
    $scope.isBoolean = function(key){
        return $scope.is(key,"BOOLEAN");
    };

    $scope.is = function(key,dataType){
        for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].valueType == dataType){
                    return true;
                }
                break;
            }
        }
        return false;
    };
    $scope.hasDataSets = function(key){
        for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                return (iroad2.data.dataElements[j].optionSet != undefined);

            }
        }
        return false;
    };
    $scope.getOptionSets = function(key){
        for(var j = 0 ;j < iroad2.data.dataElements.length;j++){
            if(iroad2.data.dataElements[j].name == key){
                if(iroad2.data.dataElements[j].optionSet){
                    return iroad2.data.dataElements[j].optionSet.options;
                }
            }
        }
        return false;
    }

    $scope.backToReportOffenseForm = function(){

        $rootScope.pageChanger.reportOffense.saveConfirmation = false;
        $rootScope.pageChanger.reportOffense.home = true;
        $rootScope.pageChanger.reportOffense.paymentConfirmation = false;
    };
    $scope.confirmReporting = function(){

        $rootScope.loadingData = true;
        //other data
        var eventDate = (new Date()).toISOString();
        var otherData = {orgUnit:$rootScope.configuration.userData.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:eventDate};
        if($scope.geoPosition){
            otherData.coordinate = {
                "latitude": $scope.geoPosition.coords.latitude,
                "longitude": $scope.geoPosition.coords.longitude
            };
        }else{
            otherData.coordinate = {"latitude": "","longitude": ""};
        }

        var savingData = $rootScope.reportingForms.offence.reprtedOffenses.data;
        var offenceEventModal = new iroad2.data.Modal("Offence Event",[]);
        offenceEventModal.save(savingData,otherData,function(result){

                if(result.httpStatus){
                    var offenseSavingResponse = result.response;
                    var offenseId = offenseSavingResponse.importSummaries[0].reference;
                    console.log('id : ' + offenseId);
                    savingData['id'] = offenseId;
                    $rootScope.reportingForms.offence.reprtedOffenses.offense = savingData;

                    //prepare selected offense for saving
                    var selectedOffenses = $rootScope.reportingForms.offence.reprtedOffenses.selectedOffenses;
                    var saveDataArray = [];
                    angular.forEach(selectedOffenses,function(registry){
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
                                },
                                function(){
                                },
                                offenceEventModal.getModalName());
                        }

                    });//end of fetching Police

                    $rootScope.pageChanger.reportOffense.saveConfirmation = false;
                    $rootScope.pageChanger.reportOffense.home = false;
                    $rootScope.pageChanger.reportOffense.paymentConfirmation = true;

                    $rootScope.loadingData = false;
                    $rootScope.$apply();
                }

                /*if(result.httpStatus){
                    var offenseSavingResponse = result.response;
                    var offenseId = offenseSavingResponse.importSummaries[0].reference;

                    $scope.reporteOffense.id = offenseId;
                    $rootScope.reportingForms.offence.reprtedOffenses.offense = $scope.reporteOffense;

                    //prepare selected offense for saving
                    var selectedOffenses = $rootScope.reportingForms.offence.reprtedOffenses.selectedOffenses;
                    var saveDataArray = [];
                    angular.forEach(selectedOffenses,function(registry){
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
                                },
                                function(){
                                },
                                offenceEventModal.getModalName());
                        }

                    });//end of fetching Police

                    $rootScope.pageChanger.reportOffense.saveConfirmation = true;
                    $rootScope.pageChanger.reportOffense.home = false;
                    $rootScope.pageChanger.reportOffense.paymentConfirmation = true;

                    $rootScope.loadingData = false;
                    $rootScope.$apply();
                }*/
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
    }



    //function for payment during reporting offense
    $scope.offensePaymentLater =function(){

        Materialize.toast('Offense Reporting Success',2000);
        $location.path('/home');
    }

    $scope.offensePaymentNow = function(){

        Materialize.toast('Offense payment data ready',1000);
        console.log('offenseData : ' + JSON.stringify($rootScope.reportingForms.offence.reprtedOffenses));
        $location.path('/home');
    }


});