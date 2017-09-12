// this is the JS counterpart to spec/requests/static_spec.rb
// here we're testing if the jasmine integration works

describe('/static/* in jasmine', function() {
  it("returns test template", function(done) {
    Promise.resolve($.get("/static/test.html"))
      .then(function(data) {
        expect(data).toMatch(/^<!--/);
      })
      .catch(function() {
        expect("Error").toEqual(null);
      })
      .then(done);
  });

  it("renders haml template", function(done) {
    Promise.resolve($.get("/static/test_haml.html.haml"))
      .then(function(data) {
        expect(data).toMatch(/<div class=['"]testclass['"]>/);
        expect(data).not.toMatch(/\.testclass/);
      })
      .catch(function() {
        expect("Error").toEqual(null);
      })
      .then(done);
  });
});
