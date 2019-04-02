# this is the Ruby counterpart to spec/javascripts/static_spec.js
# here we're testing the /static controller works

describe "/static/*" do
  it "returns test template" do
    get "/static/test"
    expect(response.status).to eq(200)
    expect(response.body).to start_with('<!--')
  end

  it "renders haml template" do
    get "/static/test_haml"
    expect(response.status).to eq(200)
    expect(response.body).to match(/<div class=['"]testclass['"]>/)
    expect(response.body).not_to include(".testclass")
  end
end
