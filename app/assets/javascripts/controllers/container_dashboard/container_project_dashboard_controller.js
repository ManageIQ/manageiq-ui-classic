/* global miqHttpInject */

ManageIQ.angular.app.controller('containerProjectDashboardController', ['$scope', 'dashboardUtilsFactory', 'chartsMixin', 'dashboardService',
  function($scope, dashboardUtilsFactory, chartsMixin, dashboardService) {
    document.getElementById('center_div').className += ' miq-body';

    // Obj-status cards init
    $scope.objectStatus = {
      services:   dashboardUtilsFactory.createServicesStatus(),
      images:     dashboardUtilsFactory.createImagesStatus(),
      containers: dashboardUtilsFactory.createContainersStatus(),
    };

    $scope.loadingDone = false;

    $scope.cpuUsageConfig = chartsMixin.chartConfig.cpuUsageConfig;
    $scope.cpuUsageConfig.layout = 'compact';
    $scope.cpuUsageConfig.title = __('CPU Utilization');

    $scope.memoryUsageConfig = chartsMixin.chartConfig.memoryUsageConfig;
    $scope.memoryUsageConfig.layout = 'compact';
    $scope.memoryUsageConfig.title = __('Memory Utilization');

    function getContainerDashboardData(response) {
      'use strict';

      var data = response.data.data;
      dashboardUtilsFactory.updateStatus($scope.objectStatus.services,   data.status.services);
      dashboardUtilsFactory.updateStatus($scope.objectStatus.images,     data.status.images);
      dashboardUtilsFactory.updateStatus($scope.objectStatus.containers, data.status.containers);

      if (data.project_utilization.interval_name === 'daily') {
        $scope.cpuUsageConfig.tooltipFn = chartsMixin.dailyTimeTooltip;
        $scope.memoryUsageConfig.tooltipFn = chartsMixin.dailyTimeTooltip;
      } else { // hourly
        $scope.cpuUsageConfig.tooltipFn = chartsMixin.hourlyTimeTooltip;
        $scope.memoryUsageConfig.tooltipFn = chartsMixin.hourlyTimeTooltip;
        $scope.cpuUsageConfig.timeFrame = __('Last 24 hours');
        $scope.memoryUsageConfig.timeFrame = __('Last 24 hours');
      }

      if (data.project_utilization.xy_data.cpu != null) {
        data.project_utilization.xy_data.cpu.xData = data.project_utilization.xy_data.cpu.xData.map(function(date) {
          return dashboardUtilsFactory.parseDate(date);
        });
        data.project_utilization.xy_data.memory.xData = data.project_utilization.xy_data.memory.xData.map(function(date) {
          return dashboardUtilsFactory.parseDate(date);
        });
      }

      $scope.cpuUsageData = chartsMixin.processData(data.project_utilization.xy_data.cpu,
        'dates',
        $scope.cpuUsageConfig.units);

      $scope.memoryUsageData = chartsMixin.processData(data.project_utilization.xy_data.memory,
        'dates',
        $scope.memoryUsageConfig.units);

      // Network metrics
      if (data.network_metrics.interval_name === 'daily') {
        $scope.networkUtilizationConfig = chartsMixin.chartConfig.dailyNetworkUsageConfig;
      } else {
        $scope.networkUtilizationConfig = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
      }

      $scope.networkUtilizationConfig.layout = 'compact';
      $scope.networkUtilizationConfig.title = __('Network Utilization');

      if (data.network_metrics.xy_data != null) {
        data.network_metrics.xy_data.xData = data.network_metrics.xy_data.xData.map(function(date) {
          return dashboardUtilsFactory.parseDate(date);
        });
      }

      $scope.networkUtilization = chartsMixin.processData(data.network_metrics.xy_data,
        'dates',
        $scope.networkUtilizationConfig.units);

      // Quotas
      $scope.quotas = [];
      $scope.barChartLayoutInline = { 'type': 'inline' };
      angular.forEach(data.quota, function(item) {
        $scope.quotas.push({
          'title': item.resource,
          'units': item.units,
          'data': {
            'used': item.quota_observed,
            'total': item.quota_enforced,
            'dataAvailable': true,
          },
        });
      });

      if ($scope.quotas.length === 0) {
        $scope.quotas.push({
          'title': '',
          'data': {
            'used': 0,
            'total': 0,
            'dataAvailable': false,
          },
        });
      }

      // Pod entity trend
      if (data.pod_metrics.interval_name === 'daily') {
        $scope.podEntityTrendConfig = chartsMixin.chartConfig.dailyPodUsageConfig;
      } else {
        $scope.podEntityTrendConfig = chartsMixin.chartConfig.hourlyPodUsageConfig;
      }

      if (data.pod_metrics.xy_data != null) {
        data.pod_metrics.xy_data.xData = data.pod_metrics.xy_data.xData.map(function(date) {
          return dashboardUtilsFactory.parseDate(date);
        });
      }

      $scope.podEntityTrend = chartsMixin.processPodUtilizationData(data.pod_metrics.xy_data,
        'dates',
        $scope.podEntityTrendConfig.createdLabel,
        $scope.podEntityTrendConfig.deletedLabel);

      // Pods table
      $scope.pods = data.pods;

      $scope.loadingDone = true;
    }

    dashboardService.autoUpdateDashboard($scope, '/container_dashboard/project_data', getContainerDashboardData);
  }]);
