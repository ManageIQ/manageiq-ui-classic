require('../helpers/old_js_file_require_helper.js');
require('../helpers/set_fixtures_helper.js');

describe('miq_grid.js', () => {
  beforeEach(() => {
    window.miqSetButtons = function() {}; // mock toolbar
    var html = "<table class=\"table-clickable table-checkable\"><thead><tr><th><input type=\"checkbox\" class=\"checkall\"/></th><th>Title</th></tr></thead><tbody data-click-url=\"/test/\"><tr data-click-id=\"check_1\"><td class=\"noclick\"><input type=\"checkbox\" value=\"check_1\"/></td><td>Item 1</td></tr><tr data-click-id=\"check_2\"><td class=\"noclick\"><input type=\"checkbox\" value=\"check_2\" /></td><td>Item 2</td></tr><tr data-click-id=\"check_3\"><td class=\"noclick\"><input type=\"checkbox\" value=\"check_3\" /></td><td>Item 3</td></tr></tbody></table>";
    setFixtures(html);
    $('table').miqGrid();
  });

  describe('.checkall', () => {
    it('checks itself if all checkboxes were checked', () => {
      $('.checkall').trigger('click');
      expect($('.checkall').prop('checked')).toEqual(true);
    })

    it('unchecks itself if at least one checkbox was unchecked', () => {
      $('.checkall').trigger('click');
      $(".noclick > input[type='checkbox']").first().trigger('click');
      expect($('.checkall').prop('checked')).toEqual(false);
    });

    it('checks all the checkboxes when none is checked', () => {
      $('.checkall').trigger('click');
      expect($(".noclick > input[type='checkbox']:checked").length).toEqual(3);
    });

    it('unchecks all the checkboxes when each is checked', () => {
      $('.checkall').trigger('click');
      expect($(".noclick > input[type='checkbox']:checked").length).toEqual(3);
      $('.checkall').trigger('click');
      expect($(".noclick > input[type='checkbox']:not(:checked)").length).toEqual(3);
    });

    it('checks the remaining checkboxes when not all are checked', () => {
      $(".noclick > input[type='checkbox']").first().trigger('click');
      expect($(".noclick > input[type='checkbox']:checked").length).toEqual(1);
      $('.checkall').trigger('click');
      expect($(".noclick > input[type='checkbox']:checked").length).toEqual(3);
    });
  })

  it('appends checked elements to the list of selected items', () => {
    $(".noclick > input[type='checkbox']").first().trigger('click');
debugger;
    expect(ManageIQ.gridChecks.join(',')).toEqual('check_1');
    $(".noclick > input[type='checkbox']").last().trigger('click');
    expect(ManageIQ.gridChecks.join(',')).toEqual('check_1,check_3');
  });

  it('sends an ajax POST request when clicking on a table row', () => {
    jest.spyOn(window, 'miqJqueryRequest').mockImplementation(() => {});
    $("tbody > tr > td:not(.noclick)").last().trigger('click');
    expect(miqJqueryRequest).toHaveBeenCalledWith('/test/?id=check_3');
  })

});
