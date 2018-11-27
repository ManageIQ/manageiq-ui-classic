describe('miq_api.js', function() {
  it("can base64 encode utf8 passwords", function(done) {
    var getArgs;

    spyOn(API, 'get').and.callFake(function(_url, args) {
      getArgs = args;
      return Promise.resolve({});
    });

    API.mock.ignore('/api/auth');

    API.login('foo', 'páššwøřď 密码 密碼')
      .then(function() {
        expect(API.get).toHaveBeenCalled();
        expect(getArgs.headers.Authorization).toBe("Basic Zm9vOnDDocWhxaF3w7jFmcSPIOWvhueggSDlr4bnorw=");
      })
      .then(done, done);
  });
});
