"use strict";

angular.module('bzk.project', ['bzk.utils', 'ngRoute']);

angular.module('bzk.project').config(function($routeProvider){
	$routeProvider.when('/p/:pid', {
			templateUrl: 'project/project.html',
			controller: 'ProjectController',
			reloadOnSearch: false
		});
});

angular.module('bzk.project').factory('ProjectResource', function($http){
	return {
		fetch: function(id) {
			return $http.get('/api/project/'+id);
		},
		jobs: function (id) {
			return $http.get('/api/project/'+id+'/job');
		},
		build: function (id, reference) {
			return $http.post('/api/project/'+id+'/job', {
				reference: reference
			});
		}
	};
});

angular.module('bzk.project').controller('ProjectController', function($scope, $routeParams, ProjectResource){
	var pId = $routeParams.pid;

	ProjectResource.fetch(pId).success(function(project){
		$scope.project = project;
	});
});

angular.module('bzk.project').controller('JobsController', function($scope, ProjectResource, $routeParams, $location, $interval){
	var pId = $routeParams.pid;
	$scope.refreshJobs = function() {
		ProjectResource.jobs(pId).success(function(jobs){
			$scope.jobs = jobs;
			console.log(jobs);
		});
	};

	$scope.refreshJobs();

	$scope.newJob = {
		reference: 'master'
	};

	$scope.newJobVisible = function(s) {
		$scope.showNewJob = s;
	};

	$scope.startJob = function() {
		ProjectResource.build($scope.project.id, $scope.newJob.reference).success(function(){
			$scope.refreshJobs();
			$scope.showNewJob = false;
		});
	};

	$scope.isSelected = function(j) {
		return j.id.indexOf($location.search().j)===0;
	};

	var refreshPromise = $interval($scope.refreshJobs, 5000);
	$scope.$on('$destroy', function() {
		$interval.cancel(refreshPromise);
	});
});

angular.module('bzk.project').controller('JobController', function($scope, ProjectResource, DateUtils, $location, $timeout){
	var jId;
	var refreshPromise;

	$scope.$on('$destroy', function() {
		$timeout.cancel(refreshPromise);
	});

	function refresh() {
		jId = $location.search().j;
  		if(jId) {
			ProjectResource.job(jId).success(function(job){
				$scope.job = job;

				if (job.status==='RUNNING') {
					refreshPromise = $timeout(refresh, 3000);
				}
			});
		}
	}

	$scope.$on('$routeUpdate', refresh);

	refresh();

	$scope.scmDataStatus = function() {
		if(!$scope.job) {
			return 'pending';
		} else if(DateUtils.isSet($scope.job.scm_metadata.date)) {
			return 'show';
		} else if($scope.job.status==='RUNNING'){
			return 'pending';
		} else {
			return 'none';
		}
	};

});

angular.module('bzk.project').controller('JobLogsController', function($scope, ProjectResource, DateUtils, $location, $timeout){
	var jId = $location.search().j;
	$scope.logger={};

	$scope.toggleJobLogs = function() {
		$scope.jobLogsVisible=!$scope.jobLogsVisible;
		if($scope.jobLogsVisible) {
			$timeout(loadLogs);
		}
	};

	function loadLogs() {
  		$scope.logger.job.prepare();
		ProjectResource.jobLog(jId).success(function(logs){
			$scope.logger.job.finish(logs);
		});
	}

	$scope.$on('$routeUpdate', function(){
		var newJid=$location.search().j;
		if(newJid!=jId) {
			$scope.jobLogsVisible=false;
			$scope.logger={};
		}
	});

});

angular.module('bzk.project').controller('VariantsController', function($scope, ProjectResource, $location, $timeout){
	$scope.isSelected = function(v) {
		return v.id===$location.search().v;
	};

	var refreshPromise;

	$scope.$on('$destroy', function() {
		$timeout.cancel(refreshPromise);
	});

	function refreshVariants() {
		var jId = $location.search().j;
  		if(jId) {
			ProjectResource.variants(jId).success(function(variants){
				$scope.variants = variants;
				setupMeta(variants);

				if($scope.job.status==='RUNNING' || _.findWhere($scope.variants, {status: 'RUNNING'})) {
					refreshPromise= $timeout(refreshVariants, 3000);
				}
			});
		}
	}

	refreshVariants();

	$scope.variantsStatus = function() {
		if($scope.variants && $scope.variants.length>0) {
			return 'show';
		} else if($scope.job.status==='RUNNING'){
			return 'pending';
		} else {
			return 'none';
		}
	};

	$scope.$on('$routeUpdate', function(){
		refreshVariants();

	});

	function setupMeta(variants) {
		var colorsDb = ['#4a148c' /* Purple */,
	'#006064' /* Cyan */,
	'#f57f17' /* Yellow */,
	'#e65100' /* Orange */,
	'#263238' /* Blue Grey */,
	'#b71c1c' /* Red */,
	'#1a237e' /* Indigo */,
	'#1b5e20' /* Green */,
	'#33691e' /* Light Green */,
	'#212121' /* Grey 500 */,
	'#880e4f' /* Pink */,
	'#311b92' /* Deep Purple */,
	'#01579b' /* Light Blue */,
	'#004d40' /* Teal */,
	'#ff6f00' /* Amber */,
	'#bf360c' /* Deep Orange */,
	'#0d47a1' /* Blue */,
	'#827717' /* Lime */,
	'#3e2723' /* Brown 500 */,
	'#000000'];

		var metaLabels = [], colors={};
		if (variants.length>0) {
			var vref = variants[0];
			_.each(vref.metas, function (m) {
				metaLabels.push(m.kind=='env'?'$'+m.name:m.name);
			});

			_.each(vref.metas, function(m, i){
				var mcolors={};
				colors[m.name] = mcolors;
				var colIdx=0;
				_.each(variants, function (v) {
					var val=v.metas[i].value;
					if (!mcolors[val]) {
						mcolors[val] = colorsDb[colIdx];
						if(colIdx<colorsDb.length-1) {
							colIdx++;
						}
					}
				});
			});

		}

		$scope.metaLabels=metaLabels;
		$scope.metaColors=colors;
	}

	$scope.metaColor = function(vmeta) {
		return $scope.metaColors[vmeta.name][vmeta.value];
	};
});


angular.module('bzk.project').controller('VariantLogsController', function($scope, ProjectResource, Scroll, $location, $timeout){
	var vId = $location.search().v;
	$scope.logger={};
	function loadLogs() {
		$scope.logger.variant.prepare();
		Scroll.toTheRight();

		ProjectResource.variantLog(vId).success(function(logs){
			$scope.logger.variant.finish(logs);
		});
	}

	$timeout(loadLogs);

});
