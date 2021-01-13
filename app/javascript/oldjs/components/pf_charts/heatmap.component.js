angular.module('patternfly.charts').component('pfHeatmap', {
  bindings: {
    data: '<',
    chartDataAvailable: '<?',
    height: '<?',
    chartTitle: '<?',
    showLegend: '<?',
    legendLabels: '<?',
    maxBlockSize: '@',
    minBlockSize: '@',
    blockPadding: '@',
    thresholds: '<?',
    heatmapColorPattern: '<?',
    clickAction: '<?',
    rangeOnHover: '<?',
    rangeHoverSize: '@',
    rangeTooltips: '<?',
  },
  templateUrl: '/static/pf_charts/heatmap.html.haml',
  controller: heatmapController,
});
heatmapController.$inject = ['$element', '$window', '$compile', '$scope', '$timeout'];

window.heatmapController = function($element, $window, $compile, $scope, $timeout) {
  'use strict';
  var vm = this;
  var prevData;
  var containerWidth;
  var containerHeight;
  var blockSize;
  var numberOfRows;
  var thresholdDefaults = [0.7, 0.8, 0.9];
  var heatmapColorPatternDefaults = ['#d4f0fa', '#F9D67A', '#EC7A08', '#CE0000'];
  var legendLabelDefaults = ['< 70%', '70-80%', '80-90%', '> 90%'];
  var rangeTooltipDefaults = ['< 70%', '70-80%', '80-90%', '> 90%'];
  var heightDefault = 200;

  var setStyles = function() {
    vm.containerStyles = {
      height: vm.height + 'px',
      display: vm.chartDataAvailable === false ? 'none' : 'block',
    };
  };

  var setSizes = function() {
    var parentContainer = $element[0].querySelector('.heatmap-container');
    containerWidth = parentContainer.clientWidth;
    containerHeight = parentContainer.clientHeight;
    blockSize = determineBlockSize();

    if ((blockSize - vm.padding) > vm.maxSize) {
      blockSize = vm.padding + vm.maxSize;

      // Attempt to square off the area, check if square fits
      numberOfRows = Math.ceil(Math.sqrt(vm.data.length));
      if (blockSize * numberOfRows > containerWidth ||
        blockSize * numberOfRows > containerHeight) {
        numberOfRows = (blockSize === 0) ? 0 : Math.floor(containerHeight / blockSize);
      }
    } else if ((blockSize - vm.padding) < vm.minSize) {
      blockSize = vm.padding + vm.minSize;

      // Attempt to square off the area, check if square fits
      numberOfRows = Math.ceil(Math.sqrt(vm.data.length));
      if (blockSize * numberOfRows > containerWidth ||
        blockSize * numberOfRows > containerHeight) {
        numberOfRows = (blockSize === 0) ? 0 : Math.floor(containerHeight / blockSize);
      }
    } else {
      numberOfRows = (blockSize === 0) ? 0 : Math.floor(containerHeight / blockSize);
    }
  };

  var determineBlockSize = function() {
    var x = containerWidth;
    var y = containerHeight;
    var n = vm.data ? vm.data.length : 0;
    var px = Math.ceil(Math.sqrt(n * x / y));
    var py = Math.ceil(Math.sqrt(n * y / x));
    var sx;
    var sy;

    if (Math.floor(px * y / x) * px < n) {
      sx = y / Math.ceil(px * y / x);
    } else {
      sx = x / px;
    }

    if (Math.floor(py * x / y) * py < n) {
      sy = x / Math.ceil(x * py / y);
    } else {
      sy = y / py;
    }
    return Math.max(sx, sy);
  };

  var redraw = function() {
    var data = vm.data;
    var color = d3.scale.threshold().domain(vm.thresholds).range(vm.heatmapColorPattern);
    var rangeTooltip = d3.scale.threshold().domain(vm.thresholds).range(vm.rangeTooltips);
    var blocks;
    var fillSize = blockSize - vm.padding;
    var highlightBlock = function(block, active) {
      block.style('fill-opacity', active ? 1 : 0.4);
    };
    var highlightBlockColor = function(block, fillColor) {
      // Get fill color from given block
      var blockColor = color(block.map(function(d) {
        return d[0].__data__.value;
      }));
      // If given color matches, apply highlight
      if (blockColor === fillColor) {
        block.style('fill-opacity', 1);
      }
    };

    var svg = $window.d3.select(vm.thisComponent);
    svg.selectAll('*').remove();
    blocks = svg.selectAll('rect').data(data).enter().append('rect');
    blocks.attr('x', function(_d, i) {
      return Math.floor(i / numberOfRows) * blockSize;
    }).attr('y', function(_d, i) {
      return i % numberOfRows * blockSize;
    }).attr('width', fillSize).attr('height', fillSize).style('fill', function(d) {
      return color(d.value);
    }).attr('uib-tooltip-html', function(d, _i) { // tooltip-html is throwing an exception
      if (vm.rangeOnHover && fillSize <= vm.rangeHoverSize) {
        return '"' + rangeTooltip(d.value) + '"';
      }
      return "'" + d.tooltip + "'";
    }).attr('tooltip-append-to-body', function() {
      return true;
    }).attr('tooltip-animation', function() {
      return false;
    });

    // Adding events
    blocks.on('mouseover', function() {
      var fillColor;
      blocks.call(highlightBlock, false);
      if (vm.rangeOnHover && fillSize <= vm.rangeHoverSize) {
        // Get fill color for current block
        fillColor = color(d3.select(this).map(function(d) {
          return d[0].__data__.value;
        }));
        // Highlight all blocks matching fill color
        blocks[0].forEach(function(block) {
          highlightBlockColor(d3.select(block), fillColor);
        });
      } else {
        d3.select(this).call(highlightBlock, true);
      }
    });
    blocks.on('click', function(d) {
      if (vm.clickAction) {
        vm.clickAction(d);
      }
    });

    // Compiles the tooltips
    angular.forEach(angular.element(blocks), function(block) {
      var el = angular.element(block);
      // TODO: get heatmap tooltips to work without using $compile or $scope
      $compile(el)($scope);
    });

    svg.on('mouseleave', function() {
      blocks.call(highlightBlock, true);
    });
  };

  vm.updateAll = function() {
    // Need to deep watch changes in chart data
    prevData = angular.copy(vm.data);

    // Allow overriding of defaults
    if (vm.maxBlockSize === undefined || isNaN(vm.maxBlockSize)) {
      vm.maxSize = 64;
    } else {
      vm.maxSize = parseInt(vm.maxBlockSize, 10);
      if (vm.maxSize < 5) {
        vm.maxSize = 5;
      } else if (vm.maxSize > 50) {
        vm.maxSize = 50;
      }
    }

    if (vm.minBlockSize === undefined || isNaN(vm.minBlockSize)) {
      vm.minSize = 2;
    } else {
      vm.minSize = parseInt(vm.minBlockSize, 10);
    }

    if (vm.blockPadding === undefined || isNaN(vm.blockPadding)) {
      vm.padding = 2;
    } else {
      vm.padding = parseInt(vm.blockPadding, 10);
    }

    if (vm.rangeHoverSize === undefined || isNaN(vm.rangeHoverSize)) {
      vm.rangeHoverSize = 15;
    } else {
      vm.rangeHoverSize = parseInt(vm.rangeHoverSize, 10);
    }

    vm.rangeOnHover = (vm.rangeOnHover === undefined || vm.rangeOnHover) ? true : false;

    if (!vm.rangeTooltips) {
      vm.rangeTooltips = rangeTooltipDefaults;
    }

    if (!vm.thresholds) {
      vm.thresholds = thresholdDefaults;
    }

    if (!vm.heatmapColorPattern) {
      vm.heatmapColorPattern = heatmapColorPatternDefaults;
    }

    if (!vm.legendLabels) {
      vm.legendLabels = legendLabelDefaults;
    }
    vm.height = vm.height || heightDefault;
    vm.showLegend = vm.showLegend || (vm.showLegend === undefined);
    vm.loadingDone = false;

    angular.element($window).on('resize', function() {
      setSizes();
      redraw();
    });

    vm.thisComponent = $element[0].querySelector('.heatmap-pf-svg');

    $timeout(function() {
      setStyles();
      setSizes();
      redraw();
    });
  };

  vm.$onChanges = function(changesObj) {
    if (changesObj.chartDataAvailable && !changesObj.chartDataAvailable.isFirstChange()) {
      setStyles();
    } else {
      vm.updateAll();
      vm.loadingDone = true;
    }
  };

  vm.$doCheck = function() {
    // do a deep compare on chartData and config
    if (!angular.equals(vm.data, prevData)) {
      setStyles();
      if (vm.chartDataAvailable !== false) {
        setSizes();
        redraw();
      }
    }
  };

  vm.$postLink = function() {
    setStyles();
    setSizes();
    redraw();
  };
}
