var twitlistsApp = angular.module('twitlists', ['ngRoute']);

twitlistsApp.controller('twitlistsCtrl',
	function ($scope, $http, $routeParams) {
		var pending = 2;//for getFriends and getLists
		function detectFriendsNotInLists() {
			console.log('detectFriendsNotInLists');
			console.log($scope);
			$scope.lists.forEach(function(list){
				list.members.forEach(function(member){
					delete $scope.friends[member.id_str];
				});
			});
			$scope.friendsNotInLists = Object.keys($scope.friends);
		}

		$http.get('/getFriends').success(function (data) {
			//convert received array to object for faster search
			$scope.friends = {};
			data.ids.forEach(function(friend){
				$scope.friends[friend] = true;
			});
			if(--pending === 0) detectFriendsNotInLists();
		});
		$http.get('/getLists').success(function (data) {
			$scope.lists = data;
			--pending;
//			if (data.length) {
//				$scope.setCurrentList(data[0]);
//			}
			$scope.lists.forEach(function(it){
				++pending;

				$http.get('/getListMembers/'+it.id).success(function(data){
					it.members = data.users;
					if(--pending === 0) detectFriendsNotInLists();
				});
			});
		});

		$scope.setCurrentList = function (list) {
			$scope.currentList = list;
			$http.get('/getStatuses/' + $scope.currentList.id).success(function (data) {
				$scope.tweets = data;
			});
		}
		//	$scope.currentList = '';
		//	$http.get('/getStatuses/'+$routeParams.listID).success(function(data){

	}
);