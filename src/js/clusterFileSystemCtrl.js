
clusterUploadModule = angular.module('HccGoApp.clusterFileSystemCtrl', ['ngRoute' ]);

clusterUploadModule.controller('clusterFileSystemCtrl', ['$scope', '$log', '$timeout', 'connectionService', '$routeParams', '$location', '$q', 'preferencesManager', function($scope, $log, $timeout, connectionService, $routeParams, $location, $q, preferencesManager) {
  
   $scope.params = $routeParams
   var clusterInterface = null;
   
   // Sets initial values
   var wd = {wdClass: "active", name: "Home", path: "."};
   $scope.wdList = [];
   $scope.clusterFolder = [];
   $scope.wdList.push(wd);
   connectionService.readDir(".").then(function (serverResponse) {
      // loops through each value returned by the server
      var tempHolder = {wdClass: "", name: ""};
      for (var x = 0; x < serverResponse.length; x++) {
         $log.debug("Server Response: " + serverResponse[x].filename);
         if (serverResponse[x].longname.charAt(0) == 'd') {
            tempHolder = {wdClass: "directory", name: serverResponse[x].filename};
            $scope.clusterFolder.push(tempHolder);
         } 

      }
   });
 
   // Sets default values on load
   $scope.onViewLoad = function () {
      $log.debug("ngView has changed");
      $scope.progressVisible = false;
      $scope.uploadStatus = false;
   }
   
   // Changes working directory for file upload wd
   $scope.cdSSHWD = function (data) {
      $log.debug($scope.wdList);
      if (data.name != $scope.wdList[$scope.wdList.length - 1].name) {
         var directoryIndex = 1;      // Sets index of array where working directory exists
         // loops through array finding wanted previous folder
         for (var x = 0; x < $scope.wdList.length; x++) {
            if ($scope.wdList[x].name == data.name) {
               directoryIndex = x;
            }
         }
         
         // Sets working directory to desired path
         $log.debug("wdList before slice");
         $log.debug($scope.wdList);
         $scope.wdList = $scope.wdList.slice(0,directoryIndex + 1);
         $scope.wdList[$scope.wdList.length - 1].wdClass = "active";
         $log.debug("wdList after slice");
         $log.debug($scope.wdList);
      
         // Resets file listing display
         
         resetFileDisplay();
      } else {
         $log.debug("Current working directory");
      }
      $log.debug($scope.wdList);
   }
   
   // Changes working directory from supplied list
   $scope.cdSSH = function (data) {
      // Establishes object to push into wdList
      var newWD = {wdClass: "active", name: data.name, path: "/" + data.name + "/"};
      
      // Changes wdClass of last object in array
      $scope.wdList[$scope.wdList.length -1].wdClass = "";
      
      // Pushes new directory in wdList
      $scope.wdList.push(newWD);
      
      // Resets file directory listing
      resetFileDisplay();
   }  
  
   // Sets the name of the file to upload in the declaration box
   $scope.setFiles = function(element) {
      $scope.$apply(function(scope) {
         $log.debug('File set: ' + element.files);
         $log.debug('Number of files: ' + element.files.length);
         $scope.files = [];
         for (var i = 0; i < element.files.length; i++) {
            $scope.files.push(element.files[i]);
         }
         $scope.progressValue = 0;
      })
   }
   
   var resetFileDisplay = function() {
      // Resets file listing display
      $log.debug("resetFileDisplay has been called");
      var filePath = ".";
      $scope.clusterFolder = [];
      for(var x = 1; x < $scope.wdList.length; x++) {
         filePath += $scope.wdList[x].path;
      }
      $log.debug($scope.wdList);
      $log.debug(filePath);
      connectionService.readDir(filePath).then(function (serverResponse) {
         // loops through each value returned by the server
         var tempHolder = {wdClass: "", name: ""};
         for (var x = 0; x < serverResponse.length; x++) {
            $log.debug("Server Response: " + serverResponse[x].filename);
            if (serverResponse[x].longname.charAt(0) == 'd') {
               tempHolder = {wdClass: "directory", name: serverResponse[x].filename};
               $scope.clusterFolder.push(tempHolder);
            } 
         }
      });

   }

   var uploadCall = function(local, remote) {
      // Runs file upload
      connectionService.uploadFile(local, remote, function(total_transferred,chunk,total){
         // Callback function for progress bar
         $log.debug("Total transferred: " + total_transferred);
         $log.debug("Chunks: " + chunk);
         $log.debug("Total: " + total);
         
         // Work on progress bar
         $scope.$apply(function(scope) {
            $scope.progressVisible = true;
            $scope.uploadStatus = false;
            $scope.max = total;
            $scope.progressValue = Math.floor((total_transferred/total)*100);
            $scope.progressVisible = true;
            $log.debug("Progress: " + ((total_transferred/total)*100) + "%");
            
            if($scope.progressValue == 100) {
               $scope.progressVisible = false;
               $scope.uploadStatus = true;
            }
         });
         
         });
   }

   // Uploads files through SFTPStream
   $scope.uploadFile = function() {

      // Let's do some debugging
      var index = 0;
      var file = $scope.files[index];
      console.log("Value of file.name: " + file.name);
      console.log("Value of file.path: " + file.path);

      // Pulls active working directory
      var filePath = "";
      for(var x = 0; x < $scope.wdList.length; x++) {
         filePath += ($scope.wdList[x].path + '/');
      }
      
      uploadCall(String(file.path),"./"); 
      resetFileDisplay();
   }
   
   // Upload entire directory
   $scope.uploadDirectory = function() {
      // Establishes access to object
      var file = $scope.files[0];
 
     uploadCall(String(file.path), "./", function(err) {
         // Resets file display
         resetFileDisplay();
     });
   } 
   
   // get current active directory
   var getWD = function() {
      var path = "";
      
      for (var x = 0; x < $scope.wdList.length; x++) {
         path += $scope.wdList[x].path;
      }
      $log.debug("Current working directory: " + path);
      return path;
   }

   preferencesManager.getClusters().then(function(clusters) {
   // Get the cluster type
   var clusterType = $.grep(clusters, function(e) {return e.label == $scope.params.clusterId})[0].type;

   switch (clusterType) {
     case "slurm":
      clusterInterface = new SlurmClusterInterface(connectionService, $q);
      break;
     case "condor":
      clusterInterface = new CondorClusterInterface(connectionService, $q);
      break;
   }

   });
   
   // jQuery controls
   
   angular.element('input[type=radio][name=radUp]').change(function() {
       if(this.value == 'file') {
           angular.element("#fileToUpload").removeAttr('directory');
           angular.element("#fileToUpload").removeAttr('webkitdirectory');
           angular.element("#headFile").text("File to upload");
           $log.debug("radio is file");
       } else if (this.value == 'folder') {
           angular.element("#fileToUpload").attr('directory', '');
           angular.element("#fileToUpload").attr('webkitdirectory', '');
           angular.element("#headFile").text("Folder to upload");
           $log.debug("radio is folder");
       }
   });
   /*
   angular.element("#btnFile").on('click', function() {
      angular.element("#btnDirectory").removeClass('active');
      angular.element("#btnFile").removeClass('active');
      angular.element("#btnFile").addClass('active');
   });
  */
  
}]);