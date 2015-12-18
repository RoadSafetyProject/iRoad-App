/**
 * Created by joseph on 12/9/15.
 */
app.controller('reportAccidentsController',function($scope,$rootScope,$localStorage){

    $scope.newAccidentBasicInfo = {};
    $scope.newAccidentBasicInfoOtherData = {}

    $scope.newAccidentVehicle = [];
    $scope.newAccidentWitness = [];

    //get current location
    var onSuccess = function(position) {
        $rootScope.$apply(function() {
            $scope.geoPosition = position;
        });
    };
    var onError = function(error) {
        Materialize.toast('Fail to capture location',3000);
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 10000, enableHighAccuracy: true});

    // Called when capture operation is finished
    //
    var captureImageSuccess = function(mediaFiles) {
        for (var i = 0; i < mediaFiles.length; i ++) {
            path = mediaFiles[i].fullPath;
            //$scope.media.image.data = mediaFiles[i].fullPath;
            $scope.media.image.data = mediaFiles[i];
            $scope.$apply();
            uploadFile(mediaFiles[i]);
        }
    };
    var captureVideoSuccess = function(mediaFiles) {
        for (var i = 0; i < mediaFiles.length; i ++) {

            path = mediaFiles[i].fullPath;
            $scope.media.video.data = mediaFiles[i];
            $scope.$apply();
            uploadFile(mediaFiles[i]);
        }
    };

    // Called if something bad happens.
    //
    var captureError =function(error) {
        Materialize.toast('An error occurred during capture',3000);
    };


    function uploadFile(mediaFile) {

        var ft = new FileTransfer(),path = mediaFile.localURL;
        var options = {};
        ft.upload(path, encodeURI($localStorage.url + "/api/fileResources"), function(result) {
                alert('fileResource : ' + result);
                alert('fileResource : ' + result.response);
                alert('fileResource : ' + result.response.response);
                alert('fileResource : ' + result.response.response.fileResource);
                alert('fileResource : ' + result.response.response.fileResource.id);
                Materialize.toast('Success upload media data',3000);
            },
            function(error) {
                alert('error : ' + JSON.stringify(error));
                Materialize.toast('Fail to upload media data',3000);
            }, options);
    }

    $scope.media = {
        'image' : {},
        'video' : {}
    };
    $scope.takeVideo = function(){

        $scope.media.video.type = 'video';
        navigator.device.capture.captureVideo(captureVideoSuccess, captureError, {limit: 1});
    };

    $scope.takePhoto = function (){

        navigator.device.capture.captureImage(captureImageSuccess, captureError, {limit: 1});
    }


    //function to show basic information
    $scope.accidentBaiscInfo = function(){
        $scope.pageChanger.reportAccidents.captureMedia = false;
        $rootScope.pageChanger.reportAccidents.basicInfo = true;
    }


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

        //adding accident attendant
        var accidentAttendantModal = new iroad2.data.Modal('Police',[]);
        var attendantRank = $scope.newAccidentBasicInfoOtherData.attendant;
        accidentAttendantModal.get({value:attendantRank},function(policeList){

            //adding police attendant if present
            if(policeList[0]){
                $scope.newAccidentBasicInfo.Police = policeList[0];
            }
        });

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
                            'signature' : null,
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
                            'signature' : null,
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
            Materialize.toast('Please Enter Number Of Vehicle(s)',3000);
        }
    }

    /*
     *function to change to next vehicle
     */
    $scope.nextVehicle = function(vehicle){


        //set visibility for next vehicle
        if($scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'] && $scope.newAccidentVehicle[vehicle].data['Licence Number']){

            var licenceNumber = $scope.newAccidentVehicle[vehicle].data['Licence Number'];
            if($scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number']){
                var plateNumber = $scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'].toUpperCase();
                $scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'] = plateNumber;
            }
            if(plateNumber.length == 7){

                plateNumber  =  plateNumber.substr(0,4) + ' ' +plateNumber.substr(4);
                $scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number'] = plateNumber;
            }
            //fetching vehicle and driver before continues
            var driverModel =  new iroad2.data.Modal('Driver',[]);

            //loading message
            $rootScope.loadingData = true;

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

                                $rootScope.loadingData = false;

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
                                                    'signature' : null,
                                                    'visibility' : true,
                                                    'numberOfWitnesses' : $scope.newAccidentBasicInfoOtherData.numberOfWitness
                                                });
                                            }else{

                                                $scope.newAccidentWitness.push({
                                                    'witness' : i,
                                                    'dataElements' : $rootScope.reportingForms.Accident.accidentWitnes,
                                                    'data' : {},
                                                    'signature' : null,
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

                            $rootScope.loadingData = false;
                            Materialize.toast('Vehicle Plate Number/Registration Number not found',3000);
                            $scope.newAccidentVehicle[vehicle].visibility = true;
                            $scope.$apply();
                            $rootScope.$apply();

                        }

                    });
                }
                else{

                    $rootScope.loadingData = false;
                    Materialize.toast('Licence Number not Found',3000);

                    $scope.newAccidentVehicle[vehicle].visibility = true;
                    $scope.$apply();
                    $rootScope.$apply();
                }

            });//end fetching accident vehicle Drivers

        }else{
            if(!$scope.newAccidentVehicle[vehicle].data['Vehicle Plate Number/Registration Number']){

                Materialize.toast('Enter Vehicle Plate Number/Registration Number',3000);
            }
            if(!$scope.newAccidentVehicle[vehicle].data['Licence Number']){

                Materialize.toast('Enter driver Licence Number ',3100);
            }

        }

    }
    $scope.signatureView = false;

    $scope.initSignature = function(){
        var canvas = document.getElementById('signatureCanvas');
        $scope.signaturePad = new SignaturePad(canvas);
        $scope.signatureView = false;
    };
    //functions for handle driver signatures
    $scope.clearCanvas = function() {
        $scope.signaturePad.clear();
    };

    //police signatures
    $scope.savePoliceSignature = function() {

        $scope.policeSignature  = $scope.signaturePad.toDataURL();
        $scope.clearCanvas();


        var ft = new FileTransfer();
        var options = {};
        ft.upload($scope.policeSignature, encodeURI($localStorage.url + "/api/fileResources"), function(result) {

                Materialize.toast('Success upload police data',3000);
                alert('fileResource : ' + result);
                alert('fileResource : ' + result.response);
                alert('fileResource : ' + result.response.response);
                alert('fileResource : ' + result.response.response.fileResource);
                alert('fileResource : ' + result.response.response.fileResource.id);
            },
            function(error) {
                alert('error : ' + JSON.stringify(error));
                Materialize.toast('Fail to upload media data',3000);
            }, options);
    };

    $scope.saveWitnessSignature = function(witness){

        $scope.newAccidentWitness[witness].signature  = $scope.signaturePad.toDataURL();
        $scope.clearCanvas();
    };

    $scope.saveDriverSignature = function(vehicle){

        $scope.newAccidentVehicle[vehicle].signature = $scope.signaturePad.toDataURL();
        $scope.clearCanvas();
    };

    //view signature
    $scope.viewSignature = function(imageData){
        $scope.signatureView = !$scope.signatureView;
        $scope.signature = imageData;
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
            if(!$scope.newAccidentWitness[witness].data['First Name']){

                Materialize.toast('Enter First Name',3000);
            }
            if(!$scope.newAccidentWitness[witness].data['Last Name']){

                Materialize.toast('Enter Last Name',3000);
            }
            if(!$scope.newAccidentWitness[witness].data['Phone Number']){

                Materialize.toast('Enter Phone number',3000);
            }
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

        $rootScope.pageChanger.reportAccidents.accidentWitness = false;
        $rootScope.pageChanger.reportAccidents.accidentVehicles = false;
        $rootScope.loadingData = true;
        $rootScope.pageChanger.reportAccidents.save = true;

        var witnessList = [];
        if($scope.newAccidentWitness){
            for(var i = 0; i < $scope.newAccidentWitness.length; i ++){
                if(($scope.newAccidentWitness[i].data)['First Name']){

                    witnessList.push($scope.newAccidentWitness[i].data);
                }
            }
        }

        var accidentEventModal = new iroad2.data.Modal('Accident',[]);
        var savedAccidentBasicInfoEvent = $scope.newAccidentBasicInfo;
        console.log(JSON.stringify(savedAccidentBasicInfoEvent));
        //convert time and date
        var eventDate = null;
        for(var key in savedAccidentBasicInfoEvent){
            if($scope.isDate(key)){

                var d = new Date(savedAccidentBasicInfoEvent[key]);
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
                savedAccidentBasicInfoEvent[key] = date;
                eventDate = date;
            }
        }

        var otherData = {orgUnit:$rootScope.configuration.userData.organisationUnits[0].id,status: "COMPLETED",storedBy: "admin",eventDate:eventDate};
        if($scope.geoPosition){
            otherData.coordinate = {
                "latitude": $scope.geoPosition.coords.latitude,
                "longitude": $scope.geoPosition.coords.longitude
            };
        }else{
            otherData.coordinate = {"latitude": "","longitude": ""};
        }

        accidentEventModal.save(savedAccidentBasicInfoEvent,otherData,function(result){
                //checking if accident basic info have been reported
                if(result.response){

                    result = result.response;
                    savedAccidentBasicInfoEvent['id'] = result.importSummaries[0].reference;
                    //saving accident Witness
                    if(witnessList.length > 0){

                        for(var i = 0;i< witnessList.length; i++){
                            var witnessEvent = witnessList[i];
                            witnessEvent.Accident = savedAccidentBasicInfoEvent;
                            //convert time and date
                            for(var key in witnessEvent){
                                if($scope.isDate(key)){

                                    var d = new Date(witnessEvent[key]);
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
                                    witnessEvent[key] = date;
                                }
                            }
                            var accidentWitnessModel = new iroad2.data.Modal('Accident Witness',[]);
                            accidentWitnessModel.save(witnessEvent,otherData,function(resultWitness){
                                $rootScope.loadingData = false;
                                $rootScope.$apply();
                                console.log('Success to add the witness to the accident' + JSON.stringify(resultWitness));
                            },function(error){

                                console.log('Fail to add the witness to the accident : ' + JSON.stringify(error));
                            },accidentWitnessModel.getModalName());

                        }
                    }//end saving all witness

                    //saving accident vehicle
                    for(var j = 0;j < $scope.newAccidentVehicle.length; j ++){

                        var accidentVehicleEvent = $scope.newAccidentVehicle[j].data;
                        accidentVehicleEvent.Accident = savedAccidentBasicInfoEvent;

                        for(var key in accidentVehicleEvent){
                            if($scope.isDate(key)){
                                var d = new Date(accidentVehicleEvent[key]);
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

                                accidentVehicleEvent[key] = date;
                            }
                        }

                        var accidentVehicleModel =  new iroad2.data.Modal('Accident Vehicle',[]);
                        accidentVehicleModel.save(accidentVehicleEvent,otherData,function(resultAccidentVehicle){

                            $rootScope.loadingData = false;
                            $rootScope.$apply();
                        },function(error){

                            $rootScope.loadingData = false;
                            $rootScope.$apply();

                        },accidentVehicleModel.getModalName());

                    }//end saving all accident vehicles

                }
                $rootScope.loadingData = false;
                $rootScope.$apply()

            }
            ,function(error){

                console.log('fails' + JSON.stringify(error));
                $rootScope.loadingData = false;
                $rootScope.$apply();
            }
            ,accidentEventModal.getModalName());//end saving all accident vehicles

    };

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

    //function to upload file media
    function uploadFileToServer(filePath){

        var ft = new FileTransfer(),output = '';;
        var options = {};
        ft.upload(filePath, encodeURI($localStorage.url + "/api/fileResources"), function(result) {
                Materialize.toast('Success upload ',3000);
                //output = ;
            },
            function(error) {
                Materialize.toast('Fail to upload media data',3000);
            }, options);
    }
});