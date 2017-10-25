/* global miqHttpInject */

  ManageIQ.angular.app.controller('containerDashboardController', ['$scope', 'dashboardUtilsFactory', 'containerChartsMixin', 'dashboardService',
    function($scope, dashboardUtilsFactory, chartsMixin, dashboardService) {
      document.getElementById('center_div').className += ' miq-body';

      // Obj-status cards init
      $scope.objectStatus = {
        providers:  dashboardUtilsFactory.createProvidersStatus(),
        alerts:     dashboardUtilsFactory.createAlertsStatus(),
        nodes:      dashboardUtilsFactory.createNodesStatus(),
        containers: dashboardUtilsFactory.createContainersStatus(),
        registries: dashboardUtilsFactory.createRegistriesStatus(),
        projects:   dashboardUtilsFactory.createProjectsStatus(),
        pods:       dashboardUtilsFactory.createPodsStatus(),
        services:   dashboardUtilsFactory.createServicesStatus(),
        images:     dashboardUtilsFactory.createImagesStatus(),
        routes:     dashboardUtilsFactory.createRoutesStatus(),
      };

      $scope.loadingDone = false;

      // Heatmaps init
      $scope.nodeCpuUsage = {
        title: __('CPU'),
        id: 'nodeCpuUsageMap',
        loadingDone: false,
      };

      $scope.nodeMemoryUsage = {
        title: __('Memory'),
        id: 'nodeMemoryUsageMap',
        loadingDone: false,
      };

      $scope.heatmaps = [$scope.nodeCpuUsage, $scope.nodeMemoryUsage];
      $scope.nodeHeatMapUsageLegendLabels = chartsMixin.nodeHeatMapUsageLegendLabels;
      $scope.dashboardHeatmapChartHeight = chartsMixin.dashboardHeatmapChartHeight;

      // Node Utilization
      $scope.cpuUsageConfig = chartsMixin.chartConfig.cpuUsageConfig;
      $scope.cpuUsageSparklineConfig = {
        tooltipFn: chartsMixin.dailyTimeTooltip,
        chartId: 'cpuSparklineChart',
      };
      $scope.cpuUsageDonutConfig = {
        chartId: 'cpuDonutChart',
        thresholds: { 'warning': '60', 'error': '90' },
      };
      $scope.memoryUsageConfig = chartsMixin.chartConfig.memoryUsageConfig;
      $scope.memoryUsageSparklineConfig = {
        tooltipFn: chartsMixin.dailyTimeTooltip,
        chartId: 'memorySparklineChart',
      };
      $scope.memoryUsageDonutConfig = {
        chartId: 'memoryDonutChart',
        thresholds: { 'warning': '60', 'error': '90' },
      };

      function getContainerDashboardData(response) {
        'use strict';

        var data = response.data.data;

        // Obj-status (entity count row)
        var providers = data.providers;
        if (providers) {
          if ($scope.id) {
            $scope.providerTypeName = providers[0].typeName;
            $scope.providerTypeIconImage = providers[0].iconImage;
            $scope.providerStatusIconImage = providers[0].statusIcon;
            $scope.isSingleProvider = true;
          } else {
            $scope.isSingleProvider = false;
            $scope.objectStatus.providers.count = 0;
            $scope.objectStatus.providers.notifications = [];
            providers.forEach(function(item) {
              $scope.objectStatus.providers.count += item.count;
              $scope.objectStatus.providers.notifications.push({
                iconImage: item.iconImage,
                count: item.count,
              });
            });
          }

          if ($scope.objectStatus.providers.count > 0) {
            $scope.objectStatus.providers.href = data.providers_link;
          }
        }

        $scope.hasAlerts = data.alerts.dataAvailable;
        dashboardUtilsFactory.updateAlertsStatus($scope.objectStatus.alerts, data.alerts);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.nodes, data.status.nodes);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.containers, data.status.containers);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.registries, data.status.registries);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.projects, data.status.projects);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.pods, data.status.pods);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.services, data.status.services);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.images, data.status.images);
        dashboardUtilsFactory.updateStatus($scope.objectStatus.routes, data.status.routes);

        // Node utilization donut
        if (data.ems_utilization.interval_name !== 'daily') {
          $scope.cpuUsageSparklineConfig.tooltipFn = chartsMixin.hourlyTimeTooltip;
          $scope.memoryUsageSparklineConfig.tooltipFn = chartsMixin.hourlyTimeTooltip;
        }
        if (data.ems_utilization.interval_name === 'hourly') {
          $scope.cpuUsageConfig.timeFrame = __('Last 24 hours');
          $scope.memoryUsageConfig.timeFrame = __('Last 24 hours');
        } else if (data.ems_utilization.interval_name === 'realtime') {
          $scope.cpuUsageConfig.timeFrame = __('Last 10 minutes');
          $scope.memoryUsageConfig.timeFrame = __('Last 10 minutes');
        }

        if (data.ems_utilization.xy_data.cpu != null) {
          data.ems_utilization.xy_data.cpu.xData = data.ems_utilization.xy_data.cpu.xData.map(function(date) {
            return dashboardUtilsFactory.parseDate(date);
          });
          data.ems_utilization.xy_data.mem.xData = data.ems_utilization.xy_data.mem.xData.map(function(date) {
            return dashboardUtilsFactory.parseDate(date);
          });
        }

        $scope.cpuUsageData = chartsMixin.processUtilizationData(data.ems_utilization.xy_data.cpu,
                                                                 'dates',
                                                                 $scope.cpuUsageConfig.units);

        $scope.memoryUsageData = chartsMixin.processUtilizationData(data.ems_utilization.xy_data.mem,
                                                                    'dates',
                                                                    $scope.memoryUsageConfig.units);

        // Heatmaps
        $scope.nodeCpuUsage = chartsMixin.processHeatmapData($scope.nodeCpuUsage, data.heatmaps.nodeCpuUsage);
        $scope.nodeCpuUsage.loadingDone = true;

        $scope.nodeMemoryUsage =
          chartsMixin.processHeatmapData($scope.nodeMemoryUsage, data.heatmaps.nodeMemoryUsage);
        $scope.nodeMemoryUsage.loadingDone = true;

        // Network metrics
        if (data.network_metrics.interval_name === 'daily') {
          $scope.networkUtilizationConfig = chartsMixin.chartConfig.dailyNetworkUsageConfig;
        } else if (data.network_metrics.interval_name === 'hourly') {
          $scope.networkUtilizationConfig = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
        } else {
          $scope.networkUtilizationConfig = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
          $scope.networkUtilizationConfig.timeFrame = __('Last 10 minutes');
        }

        if (data.network_metrics.xy_data != null) {
          data.network_metrics.xy_data.xData = data.network_metrics.xy_data.xData.map(function(date) {
            return dashboardUtilsFactory.parseDate(date);
          });
        }

        $scope.networkUtilization = chartsMixin.processUtilizationData(data.network_metrics.xy_data,
                                                                       'dates',
                                                                       $scope.networkUtilizationConfig.units);

        // Pod metrics
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

        // Image metrics
        if (data.image_metrics.interval_name === 'daily') {
          $scope.imageEntityTrendConfig = chartsMixin.chartConfig.dailyImageUsageConfig;
        } else {
          $scope.imageEntityTrendConfig = chartsMixin.chartConfig.hourlyImageUsageConfig;
        }

        if (data.image_metrics.xy_data != null) {
          data.image_metrics.xy_data.xData = data.image_metrics.xy_data.xData.map(function(date) {
            return dashboardUtilsFactory.parseDate(date);
          });
        }

        $scope.imageEntityTrend = chartsMixin.processUtilizationData(data.image_metrics.xy_data,
                                                                     'dates',
                                                                     $scope.imageEntityTrendConfig.createdLabel);

        // Trend lines data
        $scope.loadingDone = true;
      }

      dashboardService.autoUpdateDashboard($scope, '/container_dashboard/data', getContainerDashboardData);
    }]);
