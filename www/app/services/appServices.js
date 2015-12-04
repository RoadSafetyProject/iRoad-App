/**
 * Created by joseph on 10/26/15.
 */
app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(uploadObject){
        var fd = new FormData();
        angular.forEach(uploadObject.parameters,function(parameter){
            fd.append(parameter.name, parameter.value);
        });

        $http.post(uploadObject.url, fd, {
            //transformRequest: angular.identity,
            headers: {'Content-Type': "multipart/form-data"}
        })
            .success(uploadObject.success)
            .error(uploadObject.error);
    }
}])

app.service('DriverServices',function(){

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


