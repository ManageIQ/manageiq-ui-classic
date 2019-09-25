require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');

describe('miq_list_grid.js', () => {
  describe('#miqGridSort', () => {
    it('returns url with no double id', () => {
      ManageIQ.actionUrl = 'show/1000000000015';
      ManageIQ.record.parentClass = 'ems_infra';
      ManageIQ.record.parentId = '1000000000015';
      expect(miqGetSortUrl(1)).toMatch(/^\/ems_infra\/show\/1000000000015\?sortby=1&/);
    });
  });

  describe('#checkboxItemId', () => {
    // helper to create a fake jquery object
    var kvToElem = function(name, value) {
      return {
        attr: _.constant(name),
        val: _.constant(value),
      };
    };

    it('correctly parses name=check_#{id} checkboxes', () => {
      expect(checkboxItemId(kvToElem('check_1r2345', '1'))).toEqual('1r2345');
      expect(checkboxItemId(kvToElem('check_12345', '12345'))).toEqual('12345');
      expect(checkboxItemId(kvToElem('check_1', '0'))).toEqual('1');
    });

    it('correctly parses value=#{id} checkboxes', () => {
      expect(checkboxItemId(kvToElem('whatever', '1r2345'))).toEqual('1r2345');
      expect(checkboxItemId(kvToElem('whatever', '12345'))).toEqual('12345');
      expect(checkboxItemId(kvToElem('whatever', '0'))).toEqual('0');
    });
  });

  describe('#miqGridGetCheckedRows', () => {
    beforeEach(() => {
      var html = "";
      html += '<div id="test_grid_1">';
      html += '  <input type="checkbox" class="list-grid-checkbox" name="check_1r2345" value="1" checked>';
      html += '  <input type="checkbox" class="list-grid-checkbox" name="check_12345" value="1" checked>';
      html += '  <input type="checkbox" class="list-grid-checkbox" name="check_1" value="1" checked>';
      html += '  <input type="checkbox" class="list-grid-checkbox" name="check_123" value="1">';
      html += '</div>';
      setFixtures(html);
    });

    it("picks checked checkboxes from the chosen grid", () => {
      expect(miqGridGetCheckedRows('test_grid_1')).toEqual(['1r2345', '12345', '1']);
    });
  });
});
