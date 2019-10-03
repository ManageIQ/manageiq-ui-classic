describe('miq_application.js', function() {
  describe('miqSerializeForm', function () {
    beforeEach(function () {
      var html = '<div id="form_div"><textarea name="method_data">new line added\r\n\r\n</textarea></div>'
      setFixtures(html);
    });

    it('verify serialize method doesnt convert line feed value to windows line feed', function() {
      expect(miqSerializeForm('form_div')).toEqual("method_data=new+line+added%0A%0A");
    });
  });

  describe('miqShowAE_Tree', function () {
    it('uses url with the current controller', function() {
      ManageIQ.controller = 'catalog';
      spyOn(window, 'miqJqueryRequest');
      ae_url = "/" + ManageIQ.controller + "/ae_tree_select_toggle";
      miqShowAE_Tree('field_entry_point');
      expect(miqJqueryRequest).toHaveBeenCalledWith('/catalog/ae_tree_select_toggle?typ=field_entry_point');
    });
  });

  describe('add_flash', function () {
    beforeEach(function () {
      var html = '<div id="flash_msg_div"></div>';
      setFixtures(html);
    });

    it('creates a flash message', function () {
      add_flash("foo", 'error');

      var text = $('#flash_msg_div strong').text();
      var klass = $('#flash_msg_div .alert').is('.alert-danger');
      var count = $('#flash_msg_div > *').length;
      expect(text).toEqual('foo');
      expect(klass).toEqual(true);
      expect(count).toEqual(1);
    });

    it('creates two flash messages', function () {
      add_flash("bar", 'info');
      add_flash("baz", 'success');

      var count = $('#flash_msg_div > *').length;
      expect(count).toEqual(2);
    });

    it('creates a unique flash message with id', function () {
      add_flash("bar", 'info', { id: "unique" });
      add_flash("baz", 'success', { id: "unique" });

      var text = $('#flash_msg_div strong').text();
      var klass = $('#flash_msg_div .alert').is('.alert-success');
      var count = $('#flash_msg_div > *').length;
      expect(text).toEqual('baz');
      expect(klass).toEqual(true);
      expect(count).toEqual(1);
    });
  });

  describe('miqSendOneTrans', function () {
    beforeEach(function() {
      ManageIQ.oneTransition.oneTrans = undefined;

      spyOn(window, 'miqObserveRequest');
      spyOn(window, 'miqJqueryRequest');
    });

    it('calls miqJqueryRequest when given only url', function() {
      miqSendOneTrans('/foo');
      expect(miqJqueryRequest).toHaveBeenCalled();
      expect(miqObserveRequest).not.toHaveBeenCalled();
    });

    it('calls miqObserveRequest when given observe: true', function() {
      miqSendOneTrans('/foo', { observe: true });
      expect(miqJqueryRequest).not.toHaveBeenCalled();
      expect(miqObserveRequest).toHaveBeenCalled();
    });
  });

  describe('miqProcessObserveQueue', function() {
    it('queues itself when already processing', function() {
      spyOn(window, 'setTimeout');

      ManageIQ.observe.processing = true;
      ManageIQ.observe.queue = [{}];

      miqProcessObserveQueue();

      expect(setTimeout).toHaveBeenCalled();
    });

    context('with nonempty queue', function() {
      var obj = {};

      beforeEach(function() {
        spyOn(window, 'miqJqueryRequest').and.callFake(function() {
          return { then: function(a, b) { /* nope */ } };
        });

        ManageIQ.observe.processing = false;

        ManageIQ.observe.queue = [{
          url: '/foo',
          options: obj,
        }];
      });

      it('sets processing', function() {
        miqProcessObserveQueue();
        expect(ManageIQ.observe.processing).toBe(true);
      });

      it('calls miqJqueryRequest', function() {
        miqProcessObserveQueue();
        expect(miqJqueryRequest).toHaveBeenCalledWith('/foo', obj);
      });
    });

    var deferred = { resolve: function() {} , reject: function() {} };

    context('on success', function() {
      beforeEach(function() {
        ManageIQ.observe.processing = false;
        ManageIQ.observe.queue = [{ deferred: deferred }];

        spyOn(window, 'miqJqueryRequest').and.callFake(function() {
          return { then: function(ok, err) { ok() } };
        });
      });

      it('unsets processing', function() {
        miqProcessObserveQueue();
        expect(ManageIQ.observe.processing).toBe(false);
      });

      it('resolves the promise', function() {
        spyOn(deferred, 'resolve');

        miqProcessObserveQueue();
        expect(deferred.resolve).toHaveBeenCalled();
      });
    });

    context('on failure', function() {
      beforeEach(function() {
        ManageIQ.observe.processing = false;
        ManageIQ.observe.queue = [{ deferred: deferred }];

        spyOn(window, 'miqJqueryRequest').and.callFake(function() {
          return { then: function(ok, err) { err() } };
        });
      });

      it('unsets processing', function() {
        miqProcessObserveQueue();
        expect(ManageIQ.observe.processing).toBe(false);
      });

      it('rejects the promise', function() {
        spyOn(deferred, 'reject');

        miqProcessObserveQueue();
        expect(deferred.reject).toHaveBeenCalled();
      });

      it('displays an alert message', function() {
        spyOn(window, 'add_flash');

        miqProcessObserveQueue();
        expect(add_flash).toHaveBeenCalled();
      });
    });
  });

  describe('miqObserveRequest', function() {
    beforeEach(function() {
      spyOn(window, 'miqProcessObserveQueue');

      ManageIQ.observe.processing = false;
      ManageIQ.observe.queue = [];
    });

    it('sets observe: true on options', function() {
      miqObserveRequest('/foo', {});
      expect(ManageIQ.observe.queue[0].options.observe).toBe(true);
    });

    it('sets observe: true on options even without options', function() {
      miqObserveRequest('/foo');
      expect(ManageIQ.observe.queue[0].options.observe).toBe(true);
    });

    it('adds to queue', function() {
      miqObserveRequest('/foo');
      expect(ManageIQ.observe.queue[0].url).toBe('/foo');
    });

    it('calls miqProcessObserveQueue', function() {
      miqObserveRequest('/foo');
      expect(miqProcessObserveQueue).toHaveBeenCalled();
    });

    it('returns a Promise', function() {
      expect(miqObserveRequest('/foo')).toEqual(jasmine.any(Promise));
    });
  });

  describe('miqAjax', function() {
    context('on failure', function() {
      beforeEach(function () {
        spyOn(window, 'miqJqueryRequest').and.callFake(function () {
          return {
            catch: function (err) {
              err()
            }
          };
        });
      });

      it('displays an alert on error', function () {
        spyOn(window, 'add_flash');
        miqAjax('/foo', false, {});
        expect(add_flash).toHaveBeenCalled();
      });
    });
  });

  describe('miqJqueryRequest', function() {
    beforeEach(function() {
      spyOn($, 'ajax').and.callFake(function() {
        return { then: function(ok, err) { /* nope */ } };
      });
    });

    it('queues itself when processing observe queue', function() {
      ManageIQ.observe.processing = true;
      ManageIQ.observe.queue = [];

      spyOn(window, 'setTimeout');
      miqJqueryRequest('/foo');

      expect(setTimeout).toHaveBeenCalled();
    });

    it('queues itself when observe queue nonempty', function() {
      ManageIQ.observe.processing = false;
      ManageIQ.observe.queue = [{}];

      spyOn(window, 'setTimeout');
      miqJqueryRequest('/foo');

      expect(setTimeout).toHaveBeenCalled();
    });

    it('doesn\'t try to queue when passed options.observe', function() {
      ManageIQ.observe.processing = true;
      ManageIQ.observe.queue = [{}];

      spyOn(window, 'setTimeout');
      miqJqueryRequest('/foo', { observe: true });

      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('returns a Promise', function() {
      expect(miqJqueryRequest('/foo')).toEqual(jasmine.any(Promise));
    });
  });

  describe('miqSelectPickerEvent', function () {
    beforeEach(function () {
      var html = '<input id="miq-select-picker-1" value="bar">';
      setFixtures(html);
    });

    it("doesn't die on null callback", function() {
      spyOn(window, 'miqObserveRequest');
      spyOn(_, 'debounce').and.callFake(function(fn, opts) {
        return fn;
      });

      miqSelectPickerEvent('miq-select-picker-1', '/foo/');

      $('#miq-select-picker-1').val('quux').trigger('change');

      expect(miqObserveRequest).toHaveBeenCalledWith('/foo/?miq-select-picker-1=quux', {
        no_encoding: true
      });
    });

    it("sends beforeSend & complete options to miqObserveRequest", function() {
      spyOn(window, 'miqObserveRequest');
      spyOn(_, 'debounce').and.callFake(function(fn, opts) {
        return fn;
      });

      miqSelectPickerEvent('miq-select-picker-1', '/foo/', {beforeSend: true, complete: true});

      $('#miq-select-picker-1').val('1').trigger('change');

      expect(miqObserveRequest).toHaveBeenCalledWith('/foo/?miq-select-picker-1=1', {
        no_encoding: true,
        beforeSend: true,
        complete: true,
      });
    });

    it("sets beforeSend & complete options using data-miq_sparkle_on & data-miq_sparkle_off", function() {
      var html = [
        '<select class="selectpicker" id="miq-select-picker-1" name="miq-select-picker-1" data-miq_sparkle_on="true" data-miq_sparkle_off="true">',
        '  <option value="one">1</option>',
        '  <option value="two" selected="selected">2</option>',
        '</select>',
      ].join("\n");

      setFixtures(html);
      spyOn(window, 'miqObserveRequest');
      spyOn(_, 'debounce').and.callFake(function(fn, opts) {
        return fn;
      });

      miqSelectPickerEvent('miq-select-picker-1', '/foo/');

      $('#miq-select-picker-1').val('one').trigger('change');

      expect(miqObserveRequest).toHaveBeenCalledWith('/foo/?miq-select-picker-1=one', {
        no_encoding: true,
        beforeSend: true,
        complete: true,
      });
    });
  });

  describe('miqFormatNotification', function () {
    context('single placeholder', function () {
      it('replaces placeholders with bindings', function () {
        expect(miqFormatNotification('¯\_%{dude}_/¯', {dude: { text: '(ツ)' }})).toEqual('¯\_(ツ)_/¯');
      });
    });

    context('multiple placeholders', function () {
      it('replaces placeholders with bindings', function () {
        expect(miqFormatNotification('%{dude}︵ %{table}', {dude: { text: '(╯°□°）╯' }, table: {text: '┻━┻'}})).toEqual('(╯°□°）╯︵ ┻━┻');
      });
    });

    context('same placeholder multiple times', function () {
      it('replaces placeholders with bindings', function () {
        expect(miqFormatNotification('( %{eye}▽%{eye})/', {eye: { text: 'ﾟ' }})).toEqual('( ﾟ▽ﾟ)/');
      });
    });
  });

  describe('User login form', function() {
    beforeEach(function() {
      var html = '<div class="form-horizontal" id="login_div">\
        <div class="form-group">\
          <label class="col-md-3 control-label">Username</label>\
          <div class="col-md-9">\
            <input type="text" name="user_name" id="user_name" class="form-control" placeholder="Username" onkeypress="if (miqEnterPressed(event)) miqAjaxAuth();">\
          </div>\
        </div>\
        <div class="form-group">\
          <label class="col-md-3 control-label">Password</label>\
          <div class="col-md-9">\
            <input type="password" name="user_password" id="user_password" onkeypress="if (miqEnterPressed(event)) miqAjaxAuth();" autocomplete="off" placeholder="Password" class="form-control">\
          </div>\
        </div>\
        <div class="form-group">\
          <div class="col-xs-8 col-md-offset-3 col-md-6">\
            <div id="back_button" style="display: none">\
              <a data-method="post" title="Back" data-remote="true" href="/dashboard/authenticate?button=back">Back</a>\
            </div>\
          </div>\
        </div>\
        <div class="col-xs-4 col-md-3 submit">\
          <a id="login" class="btn btn-primary" alt="Log In" title="Log In" onclick="miqAjaxAuth(\'/dashboard/authenticate?button=login\'); return false;" href="">Log In</a>\
          <a id="sso_login" class="btn btn-primary" alt="SSO Log In" title="SSO Log In" style="display: none;" onclick="miqAjaxAuthSso(\'/dashboard/kerberos_authenticate?button=sso_login\'); return false;" href="">SSO Log In</a>\
        </div>\
      </div>';

      setFixtures(html);
    });

    context('failed login', function() {
      beforeEach(function() {
        // simulate failed authentication api call
        spyOn(window, 'miqJqueryRequest').and.callFake(function() {
          return Promise.reject();
        });

        spyOn(window, 'miqClearLoginFields').and.callThrough();
      });

      it('removes user and password field from log in form', function(done) {
        var user = $('#user_name');
        var password = $('#user_password');

        user.val('Bob');
        password.val('shh');

        miqAjaxAuth('/dashboard/authenticate?button=login')
          .then(function() {
            expect(miqClearLoginFields).toHaveBeenCalled();
            expect(document.activeElement.id).toEqual(user.attr('id'));
            expect(user.val()).toBe('');
            expect(password.val()).toBe('');

            done();
          });
      });
    });
  });

  describe('miqCheckForChanges', () => {
    let tmpManageIQ;

    beforeEach(() => {
      tmpManageIQ = ManageIQ.redux.store.getState;
    });

    afterEach(() => {
      ManageIQ.redux.store.getState = tmpManageIQ;
    });

    it('returns true by default', () => {
      expect(miqCheckForChanges()).toEqual(true);
    });

    it('returns true if no changes in tagging', () => {
      ManageIQ.redux.store.getState = () => ({
        tagging: {
          appState: {
            assignedTags: [],
          },
          initialState: {
            assignedTags: [],
          },
        },
      });

      expect(miqCheckForChanges()).toEqual(true);
    });

    it('returns value from confirm if there are changes in tagging', () => {
      spyOn(window, 'confirm').and.returnValues(true, false);

      ManageIQ.redux.store.getState = () => ({
        tagging: {
          appState: {
            assignedTags: [{id: '1011531', description: 'description', values: [{id: '108', description: '2GB'}]}],
          },
          initialState: {
            assignedTags: [],
          },
        },
      });

      expect(window.confirm).not.toHaveBeenCalled();
      expect(miqCheckForChanges()).toEqual(true);
      expect(window.confirm).toHaveBeenCalled();
      expect(miqCheckForChanges()).toEqual(false);
    });
  });
});
