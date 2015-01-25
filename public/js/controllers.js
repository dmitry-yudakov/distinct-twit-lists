var twitlistsApp = angular.module('twitlists', ['ngRoute']);

twitlistsApp.controller('twitlistsCtrl',
	function ($scope, $http, $routeParams) {
		$http.get('/getLists').success(function (data) {
			$scope.lists = data;
		});
		$scope.setCurrentList = function (list) {
			$scope.currentList = list;
			$http.get('/getStatuses/' + $scope.currentList.id).success(function (data) {
				$scope.tweets = data;
			});
		}
		//	$scope.currentList = '';
		//	$http.get('/getStatuses/'+$routeParams.listID).success(function(data){

	});