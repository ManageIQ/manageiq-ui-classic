require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');

describe('miq_flash.js', () => {
  describe('clearFlash', () => {
    beforeEach(() => {
      var html = '<html><head></head><body><div id="flash_msg_div">test</div></body></html>';
      setFixtures(html);
    });

    it('clears the flash_msg_div', () => {
      clearFlash();
      expect($('#flash_msg_div').html()).toEqual('');
    });
  });
  describe('longAlert', () => {
    beforeEach(() => {
      var html = '<html><head></head><body><div id="flash_msg_div"></div></body></html>';
      setFixtures(html);
    });

    it('displays flash_msg_div "View More" button', () => {
      // Expect alert msg div to add the "See More" button to the div.
      add_flash("Lorem ipsum dolor sit amet, usu ei mollis vivendum, ancillae indoctum philosophia an pri, affert partiendo cum ne. Nec animal tincidunt philosophia ea. Ne mea liber gloriatur, ignota dictas mei ne. Omittam eleifend consequuntur vix eu, everti accusata accommodare et eam. Ut vidit semper instructior duo, usu in autem inermis. Viris pertinax constituto per id, at debet apeirian persecuti has. Nostrum expetenda qui ad, mazim iriure id duo, est alii wisi at.", 'error' , {long_alert: true});
      var flash_msg_div = '<div class="flash_text_div"><div class="alert alert-danger text-overflow-pf"><button class="close" data-dismiss="alert"><span class="pficon pficon-close"></span></button><span class="pficon pficon-error-circle-o"></span><strong>Lorem ipsum dolor sit amet, usu ei mollis vivendum, ancillae indoctum philosophia an pri, affert partiendo cum ne. Nec animal tincidunt philosophia ea. Ne mea liber gloriatur, ignota dictas mei ne. Omittam eleifend consequuntur vix eu, everti accusata accommodare et eam. Ut vidit semper instructior duo, usu in autem inermis. Viris pertinax constituto per id, at debet apeirian persecuti has. Nostrum expetenda qui ad, mazim iriure id duo, est alii wisi at.</strong><div class="alert_expand_link" style="display: none;"><strong><a href="#">View More</a></strong></div></div></div>'
      expect($('#flash_msg_div').html()).toEqual(flash_msg_div);
    });

    it('does not display flash_msg_div "See More" button', () => {
      // Expect alert msg div to *not add* the "See More" button to the div.
      add_flash("This is a really long alert!", 'error');
      var flash_msg_div = '<div class="flash_text_div"><div class="alert alert-danger"><button class="close" data-dismiss="alert"><span class="pficon pficon-close"></span></button><span class="pficon pficon-error-circle-o"></span><strong>This is a really long alert!</strong></div></div>'
      expect($('#flash_msg_div').html()).toEqual(flash_msg_div);
    });
  });
});
