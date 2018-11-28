require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');

describe('resizable-sidebar.js', () => {
  beforeEach(() => {
    var html = ''
    html += '<div class="container-fluid resizable-sidebar">'
    html += '  <div class="row">'
    html += '    <div class="col-md-10 col-md-push-2 resizable" id="right">'
    html += '      <div class="resizer hidden-xs">'
    html += '        <div class="resizer-box">'
    html += '          <div class="btn-group">'
    html += '            <div class="btn btn-default resize-left">'
    html += '              <span class="fa fa-angle-left"></span>'
    html += '            </div>'
    html += '            <div class="btn btn-default resize-right">'
    html += '              <span class="fa fa-angle-right"></span>'
    html += '            </div>'
    html += '          </div>'
    html += '        </div>'
    html += '      </div>'
    html += '    </div>'
    html += '    <div class="col-md-2 col-md-pull-10 resizable" id="left">'
    html += '    </div>'
    html += '  </div>'
    html += '</div>'

    setFixtures(html);
    $('div.container-fluid.resizable-sidebar').resizableSidebar();

    // we're not testing the backend
    spyOn($, 'ajax').and.callFake(function() {
      return Promise.resolve({});
    });
  });

  it('hide sidebar', () => {
    $('.resize-left').click();
    expect($('#left').hasClass('col-md-2')).toBe(false);
    expect($('#left').hasClass('col-md-pull-10')).toBe(false);
    expect($('#left').hasClass('hidden-lg')).toBe(true);
    expect($('#left').hasClass('hidden-md')).toBe(true);

    expect($('#right').hasClass('col-md-10')).toBe(false);
    expect($('#right').hasClass('col-md-push-2')).toBe(false);
    expect($('#right').hasClass('col-md-12')).toBe(true);
    expect($('#right').hasClass('col-md-push-0')).toBe(true);
  });

  it('show sidebar', () => {
    $('.resize-left').click();
    $('.resize-right').click();

    expect($('#left').hasClass('hidden-md')).toBe(false);
    expect($('#left').hasClass('hidden-lg')).toBe(false);
    expect($('#left').hasClass('col-md-2')).toBe(true);
    expect($('#left').hasClass('col-md-pull-10')).toBe(true);

    expect($('#right').hasClass('col-md-12')).toBe(false);
    expect($('#right').hasClass('col-md-push-0')).toBe(false);
    expect($('#right').hasClass('col-md-10')).toBe(true);
    expect($('#right').hasClass('col-md-push-2')).toBe(true);
  });

  it('broaden sidebar', () => {
    for (var i=2; i<=5; i++) {
      expect($('#left').hasClass('col-md-' + (i-1))).toBe(false);
      expect($('#left').hasClass('col-md-pull-' + (11-i))).toBe(false);
      expect($('#left').hasClass('col-md-' + i)).toBe(true);
      expect($('#left').hasClass('col-md-pull-' + (12-i))).toBe(true);

      expect($('#right').hasClass('col-md-' + (13-i))).toBe(false);
      expect($('#right').hasClass('col-md-push-' + (i+1))).toBe(false);
      expect($('#right').hasClass('col-md-' + (12-i))).toBe(true);
      expect($('#right').hasClass('col-md-push-' + i)).toBe(true);

      $('.resize-right').click();
    }
  });

  it('narrow sidebar', () => {
    for (var i=2; i<5; i++) {
      $('.resize-right').click();
    }

    for (var i=5; i>=2; i--) {
      expect($('#left').hasClass('col-md-' + (i+1))).toBe(false);
      expect($('#left').hasClass('col-md-pull-' + (13-i))).toBe(false);
      expect($('#left').hasClass('col-md-' + i)).toBe(true);
      expect($('#left').hasClass('col-md-pull-' + (12-i))).toBe(true);

      expect($('#right').hasClass('col-md-' + (11-i))).toBe(false);
      expect($('#right').hasClass('col-md-push-' + (i-1))).toBe(false);
      expect($('#right').hasClass('col-md-' + (12-i))).toBe(true);
      expect($('#right').hasClass('col-md-push-' + i)).toBe(true);

      $('.resize-left').click();
    }
  });

  it('extend sidebar limit', () => {
    for (var i=0; i<5; i++) {
      $('.resize-right').click();
    }
    expect($('#left').hasClass('col-md-5')).toBe(true);
    expect($('#left').hasClass('col-md-pull-7')).toBe(true);
    expect($('#right').hasClass('col-md-7')).toBe(true);
    expect($('#right').hasClass('col-md-push-5')).toBe(true);
  });
});
