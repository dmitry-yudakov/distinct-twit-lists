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

		function setEventHandlers() {
			console.log('Set drag&drop event handlers');
			var cols = document.querySelectorAll('.twcolumn');
//			var cols = document.querySelectorAll('.listName');
			[].forEach.call(cols, function (col) {
				col.addEventListener('dragstart', function(e){
					var item = {
						member: e.srcElement.innerText,
						list: e.srcElement.childNodes[1].innerText
					}
					item.list_id = $scope.tweetsByList[item.list].info.id;
					console.log('dragstart',e);
					console.log('name detected:', item.member);
					console.log('list:', item.list, 'list id:', item.list_id);
					e.dataTransfer.setData('text/plain',JSON.stringify(item)); 
				}, false);
//				col.addEventListener('dragenter', function(e){
//					console.log('dragenter',e);
//				}, false)
				col.addEventListener('dragover', function(e){
		//			console.log('dragover',e);
					e.preventDefault();
		//			console.log('preventDefault',e);
				}, false);
//				col.addEventListener('dragleave', function(e){console.log('dragleave',e)}, false);
				function createDropHandler(targetListName){
					return function(e){
						console.log('drop',e);
						var data = e.dataTransfer.getData('text/plain');
						console.log('data', data);
						var item = JSON.parse(e.dataTransfer.getData('text/plain'));
						console.log('Item',item);
						console.log('Target list: ', targetListName);
						var targetListId = $scope.tweetsByList[targetListName].info.id;
						console.log('Target list: ', targetListId);
						if(item.list != targetListName) {
							console.log('Move %s from %s to %s', item.member, item.list, targetListName);
							$http.post('/moveMember/'+item.member+'/'+item.list_id+'/'+ targetListId).success(function (data) {
								console.log('Move completed');
								loadTweets();
							});
						}
					}
				}
				var listName = col.childNodes[0].childNodes[0].innerText;
				console.log('Column', col, listName);
				col.addEventListener('drop', createDropHandler(listName), false);
//				col.addEventListener('dragend', function(e){console.log('dragend',e)}, false);
				console.log('Register event');
			});
		//	alert('hello'+cols.length);
		}
	
		function loadTweets() {
			var pendingLists = 0;
			$scope.lists.forEach(function (it) {
				++pendingLists;
				$http.get('/getStatuses/' + it.id).success(function (data) {
					$scope.tweetsByList[it.name] = {
						name: it.name,
						info: it,
						tweets: data
					}
					
					if(--pendingLists == 0){
						setEventHandlers();
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