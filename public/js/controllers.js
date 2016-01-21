var twitlistsApp = angular.module('twitlists', ['ngRoute']);

twitlistsApp.controller('twitlistsCtrl',
	function ($scope, $http, $routeParams) {
		var defaultList = 'Default';
		var handlersSet = false;
		$scope.tweetsByList = {};

		function loadLists(cbDone) {
			$http.get('/getLists').success(function (data) {
				console.log('getLists data:', data);
				if(typeof data === 'string') {
					$scope.errorMessage = data;
					return;
				}
				$scope.lists = data;
				return cbDone();
			});
		}
	
		function loadFriends(cbDone) {
			$http.get('/getFriends').success(function (data) {
				//convert received array to object for faster search
				$scope.friends = {};
				data.ids.forEach(function (friend) {
					$scope.friends[friend] = true;
				});
				cbDone();
			});
		}
	
		function loadListsMembers(cbDone) {
			var pending = 0;
			$scope.lists.forEach(function (it) {
				++pending;
				$http.get('/getListMembers/' + it.id).success(function (data) {
					it.members = data.users;
					if (--pending === 0)
						cbDone();
				});
			});
		}
	
		function moveMember(member, fromListId, toListId) {
			$http.post('/moveMember/'+member+'/'+fromListId+'/'+ toListId).success(function (data) {
				console.log('Move completed');
				loadTweets({lists:[fromListId, toListId]});
			});
		}

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
							moveMember(item.member, item.list_id, targetListId);
						}
					}
				}
				var listName = col.childNodes[0].childNodes[0].innerText;
				console.log('Column', col, listName);
				col.addEventListener('drop', createDropHandler(listName), false);
//				col.addEventListener('dragend', function(e){console.log('dragend',e)}, false);
				console.log('Register event');
			});
		}
	
		function loadTweets(params) {
			console.log('Load tweets', params);
			var pendingLists = 0;
			var listsToLoad = $scope.lists;

			if(params.lists) { // load tweets for some lists only
				listsToLoad = listsToLoad.filter(function(it) {
					return params.lists.indexOf(it.id) != -1;
				});
			}

			listsToLoad.forEach(function (it) {
				++pendingLists;
				var idHint = '';
				if(params.append) {
					if(it.minTweetId) idHint += '?max_id=' + it.minTweetId;
				}
				
				$http.get('/getStatuses/' + it.id + idHint).success(function (data) {
					console.log('received statuses data', data);
					
					var list = $scope.tweetsByList[it.name];
					if( ! list ) {
						$scope.tweetsByList[it.name] = list = {
							name: it.name,
							info: it,
							tweets: []
						};
					}

					if(params.append) {//append new tweets to the old ones
						//remove the first tweet that we already have
						data.shift();
						Array.prototype.push.apply(list.tweets, data);
					} else {
						list.tweets = data;
					}
					
					if(!data.length) {
						it.maxTweetId = it.minTweetId = '';
						return;
					}

					it.maxTweetId = data[0].id_str;
					it.minTweetId = data[ data.length - 1 ].id_str;
					console.log('latest id', data[0].id_str);
					
					if(--pendingLists == 0 && !handlersSet){
						handlersSet = true;
						// workaround - it takes time between changing the data and building html
						setTimeout(setEventHandlers, 1000);
					}
				});
			});
		}

	
		$scope.print = function(tw) {
//			alert(JSON.stringify(tw, null, '\t'));
			console.log(tw);
		}
		
		$scope.loadMore = function(tweetList) {
			console.log('Load more', tweetList);
			loadTweets({lists: [tweetList.info.id], append: true});
		}
		
		$scope.detectUnlistedFriends = function() {
			//TODO fix this shit with async or promises
			loadLists(function() {
				loadFriends(function() {
					loadListsMembers(function() {
						detectFriendsNotInLists(function(){
							loadTweets({append:false});
						});
					});
				});
			});
		}
		
		// initial loading lists and tweets
		loadLists(function() {
			loadTweets({append:false});
		});
	}
);