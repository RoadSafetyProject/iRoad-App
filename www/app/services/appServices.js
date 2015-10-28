/**
 * Created by joseph on 10/26/15.
 */
var appServices = angular.module('appServices',[]);

appServices.service('DriverServices',function(){

    //prepare driver modal
    var driverModal =  new iroad2.data.Modal('Driver',[]);

    //verify driver
    this.verifyDriver = function(driverLicenceNumber){
        //fetching driver from system
        driverModal.get({value:driverLicenceNumber},function(result){
            console.log('Driver : ' + driverLicenceNumber + '-->' + JSON.stringify(result));
            return result[0];
        });

    }

});


