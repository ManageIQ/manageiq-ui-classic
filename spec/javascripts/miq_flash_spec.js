describe('miq_flash.js', function() {
  describe('clearFlash', function() {
    beforeEach(function() {
      var html = '<html><head></head><body><div id="flash_msg_div">test</div></body></html>';
      setFixtures(html);
    });

    it('clears the flash_msg_div', function() {
      clearFlash();
      expect($('#flash_msg_div').html()).toEqual('');
    });
  });
});
