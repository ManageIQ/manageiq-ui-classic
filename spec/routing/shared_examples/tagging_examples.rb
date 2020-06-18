shared_examples_for "A controller that has tagging routes" do
  describe "#tagging_edit" do
    it "routes with GET" do
      expect(get("/#{controller_name}/tagging_edit/123")).to route_to(
        "#{controller_name}#tagging_edit", :id => "123"
      )
    end

    it "routes with POST" do
      expect(post("/#{controller_name}/tagging_edit/123")).to route_to(
        "#{controller_name}#tagging_edit", :id => "123"
      )
    end
  end
end
