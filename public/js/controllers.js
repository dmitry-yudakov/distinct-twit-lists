var twitlistsApp = angular.module('twitlists', ['ngRoute']);

twitlistsApp.controller('twitlistsCtrl',
	function ($scope, $http, $routeParams) {
		var pending = 0;
		var defaultList = 'Default';
		$scope.tweetsByList = {};

		function detectFriendsNotInLists(cbDone) {
			//			console.log('detectFriendsNotInLists');
			//			console.log($scope);

			var defaultListID;

			//			console.log('$scope.friends', $scope.friends);
			$scope.lists.forEach(function (list) {
				console.log('Check list', list.name);
				list.members.forEach(function (member) {
					//					console.log('Check for member', member.id_str, $scope.friends[member.id_str] );
					delete $scope.friends[member.id_str];
				});
				if (list.name === defaultList) {
					console.log('Default list found');
					defaultListID = list.id;
				}
			});
			$scope.friendsNotInLists = Object.keys($scope.friends);
			if (!$scope.friendsNotInLists.length) {
				console.log('all friends are in lists');
				if(cbDone){
					cbDone();
				}
				return;
			}

			console.log('$scope.friendsNotInLists', $scope.friendsNotInLists);
			//			console.log('Lists:', $scope.lists);

			$scope.addMembersToDefautList = function (defaultListID) {
				$http.post('/addMembersToList/' + defaultListID + '/' + $scope.friendsNotInLists.join(','))
					.success(function () {
						console.log('Added members to default');
						if(cbDone){
							cbDone();
						}
					});
			}

			if (!defaultListID) {
				console.log('default list not found');
				$http.post('/createList/' + defaultList).success(function (data) {
					console.log('Created default list');
					$scope.addMembersToDefautList(data.id_str);
				});
			} else {
				console.log('default list found, id', defaultListID);
				$scope.addMembersToDefautList(defaultListID);
			}


		}

		function loadTweets() {
			$scope.lists.forEach(function (it) {
				$http.get('/getStatuses/' + it.id).success(function (data) {
					$scope.tweetsByList[it.name] = {
						name: it.name,
						info: it,
						tweets: data
					}
				});
			});
		}


//		++pending;
//		$http.get('/getFriends').success(function (data) {
//			//convert received array to object for faster search
//			$scope.friends = {};
//			data.ids.forEach(function (friend) {
//				$scope.friends[friend] = true;
//			});
//			if (--pending === 0) detectFriendsNotInLists();
//		});
	
		++pending;
		$http.get('/getLists').success(function (data) {
			$scope.lists = data;
			--pending;
			if (data.length) {
				$scope.setCurrentList(data[0]);
			}
//			$scope.lists.forEach(function (it) {
//				++pending;
//
//				$http.get('/getListMembers/' + it.id).success(function (data) {
//					it.members = data.users;
//					if (--pending === 0) detectFriendsNotInLists(function(){
//						loadTweets();
//					});
//				});
//			});
			
			loadTweets();
		});

		$scope.setCurrentList = function (list) {
			//			$scope.currentList = list;
			//			$http.get('/getStatuses/' + $scope.currentList.id).success(function (data) {
			//				$scope.tweets = data;
			//			});
		}
		//	$scope.currentList = '';
		//	$http.get('/getStatuses/'+$routeParams.listID).success(function(data){

		$scope.print = function(tw) {
//			alert(JSON.stringify(tw, null, '\t'));
			console.log(tw);
		}
	}
);