describe ProviderForemanController, "::AdvancedSearch" do
  before :each do
    stub_user(:features => :all)
    controller.instance_variable_set(:@sb, {})
  end

  describe "#adv_search_redraw_left_div" do
    before :each do
      controller.instance_variable_set(:@sb, :active_tree => :configuration_manager_cs_filter_tree)
    end

    it "calls build_configuration_manager_cs_filter_tree method in Config Mgmt Configured Systems when saving a filter" do
      allow(controller).to receive(:adv_search_redraw_listnav_and_main)

      expect(controller).to receive(:build_configuration_manager_cs_filter_tree).once
      controller.send(:adv_search_redraw_left_div)
    end
  end
end
