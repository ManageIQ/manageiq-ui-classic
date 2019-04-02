describe('packs/global.js', function() {
  context("jquery modules", function() {
    it('loads bootstrap', function() {
      expect($.fn.modal).toBeDefined();
    });

    it('loads bootstrap-datepicker', function() {
      expect($.fn.datepicker).toBeDefined();
    });

    it('loads bootstrap-select', function() {
      expect($.fn.selectpicker).toBeDefined();
    });

    it('loads bootstrap-switch', function() {
      expect($.fn.bootstrapSwitch).toBeDefined();
    });

    it('loads bootstrap-touchspin', function() {
      expect($.fn.TouchSpin).toBeDefined();
    });

    it('loads c3', function() {
      expect(window.c3).toBeDefined();
    });

    it('loads d3', function() {
      expect(window.d3).toBeDefined();
    });

    it('loads eonasdan-bootstrap-datetimepicker', function() {
      expect($.fn.datetimepicker).toBeDefined();
    });
  });

  context('angular modules', function() {
    it('loads angular-bootstrap-switch', function() {
      expect(angular.module('frapontillo.bootstrap-switch')).toBeDefined();
    });

    it('loads angular-patternfly', function() {
      expect(angular.module('patternfly')).toBeDefined();
    });

    it('loads angular-ui-bootstrap', function() {
      expect(angular.module('ui.bootstrap')).toBeDefined();
    });
  });

  context('d3 plugins', function() {
    it('loads patternfly-timeline', function() {
      expect(d3.chart.timeline).toBeDefined();
      expect(d3.chart.timeline().start).toBeDefined();
      expect(d3.chart.timeline().end).toBeDefined();
    });
  });
});
