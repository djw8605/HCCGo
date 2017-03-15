describe('Data Usage Service', function() {
    var tutorialCtrl;
    var $q;
    var $rootScope;
    var deferred;
    var $controller;

    beforeEach(angular.mock.module('HccGoApp.tutorialCtrl'));
    beforeEach(angular.mock.module('navService'));
    beforeEach(angular.mock.module('ConnectionServiceModule'));
    beforeEach(angular.mock.module('NotifierModule'));
    beforeEach(angular.mock.module('PreferencesManager'));
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('HccGoApp.jobHistoryCtrl'));
    beforeEach(angular.mock.module('dbService'));
    beforeEach(angular.mock.module('AnalyticsModule'));
    beforeEach(angular.mock.module('filePathService'));


    beforeEach(inject(function(_$rootScope_, _$q_, connectionService) {
        

        connectionService.connectionDetails = {
          "username": "derek",
          "hostname": "example.unl.edu",
        }

    }));

    
    beforeEach(angular.mock.inject(function(_$controller_) {
	       $controller = _$controller_;
    }));
    
    // A simple test to verify the Users factory exists
    it('should exist', function() {
      var $scope = {};
      var controller = $controller('tutorialCtrl', {$scope: $scope} );
      expect(controller).toBeDefined();
    });
    
    
});