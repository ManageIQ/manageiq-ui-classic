require 'routing/shared_examples'

describe 'routes for ServiceController' do
  let(:controller_name) { 'service' }

  it_behaves_like "A controller that has dialog runner routes"
  it_behaves_like 'A controller that has download_data routes'

  describe "#button" do
    it "routes with POST" do
      expect(post("/service/button")).to route_to("service#button")
    end
  end

  describe "#ownership_update" do
    it "routes with POST" do
      expect(post("/service/ownership_update")).to route_to("service#ownership_update")
    end
  end

  describe "#reload" do
    it "routes with POST" do
      expect(post("/service/reload")).to route_to("service#reload")
    end
  end

  describe "#show" do
    it "routes with GET" do
      expect(get("/service/show")).to route_to("service#show")
    end
  end
end
