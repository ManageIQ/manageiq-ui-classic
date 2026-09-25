shared_examples_for "A controller that has dialog runner routes" do
  describe "#open_url_after_dialog" do
    it "routes with POST" do
      expect(post("/#{controller_name}/open_url_after_dialog")).to route_to("#{controller_name}#open_url_after_dialog")
    end
  end
end
