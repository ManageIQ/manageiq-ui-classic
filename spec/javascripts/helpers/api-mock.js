API._fetch = API.mock();

function spyOnFetch() {
  return spyOn(API._fetch, 'fetch')
    .and.callFake(function() {
      return new Promise(function() {});
    });
}

function expectFetch() {
  return expect(API._fetch.fetch);
}
