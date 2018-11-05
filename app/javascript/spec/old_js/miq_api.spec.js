describe('miq_api.js', () => {
  it("can base64 encode utf8 passwords", done => {
    var getArgs;

    jest.spyOn(vanillaJsAPI, 'get').mockImplementation(function(_url, args) {
      getArgs = args;
      return Promise.resolve({});
    });

    vanillaJsAPI.login('foo', 'páššwøřď 密码 密碼')
      .then(function() {
        expect(vanillaJsAPI.get).toHaveBeenCalled();
        expect(getArgs.headers.Authorization).toBe("Basic Zm9vOnDDocWhxaF3w7jFmcSPIOWvhueggSDlr4bnorw=")
      })
      .then(done, done);
  });
});
