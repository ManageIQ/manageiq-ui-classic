describe FirmwareController do
  describe "#accordion_select" do
    it "routes with POST" do
      expect(post("/firmware/accordion_select")).to route_to("firmware#accordion_select")
    end
  end

  describe "#explorer" do
    it "routes with GET" do
      expect(get("/firmware/explorer")).to route_to("firmware#explorer")
    end

    it "routes with POST" do
      expect(post("/firmware/explorer")).to route_to("firmware#explorer")
    end
  end

  describe "#firmware_registry_list" do
    it "routes with POST" do
      expect(post("/firmware/firmware_registry_list")).to route_to("firmware#firmware_registry_list")
    end
  end

  describe "#reload" do
    it "routes with POST" do
      expect(post("/firmware/reload")).to route_to("firmware#reload")
    end
  end

  describe "#tree_autoload" do
    it "routes with POST" do
      expect(post("/firmware/tree_autoload")).to route_to("firmware#tree_autoload")
    end
  end

  describe "#tree_select" do
    it "routes with POST" do
      expect(post("/firmware/tree_select")).to route_to("firmware#tree_select")
    end
  end

  describe "#x_button" do
    it "routes with POST" do
      expect(post("/firmware/x_button")).to route_to("firmware#x_button")
    end
  end

  describe "#x_history" do
    it "routes with POST" do
      expect(post("/firmware/x_history")).to route_to("firmware#x_history")
    end
  end
end
