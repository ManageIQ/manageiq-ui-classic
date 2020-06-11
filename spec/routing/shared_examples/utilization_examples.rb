shared_examples_for "A controller that has utilization routes" do
  describe "#utilization" do
    it "routes with GET" do
      expect(get("/#{controller_name}/utilization")).to route_to("#{controller_name}#utilization")
    end
  end
end
