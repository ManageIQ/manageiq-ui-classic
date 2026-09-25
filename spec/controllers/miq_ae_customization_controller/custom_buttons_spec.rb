describe MiqAeCustomizationController do
  before do
    stub_user(:features => :all)
    EvmSpecHelper.local_miq_server
  end
  context "::CustomButtons" do
    context "#ab_get_node_info" do
      it "correct target class gets set when assigned button node is clicked" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host", :name => "Some Name")
        target_classes = {}
        CustomButton.button_classes.each { |db| target_classes[ui_lookup(:model => db)] = db }
        controller.instance_variable_set(:@sb, :target_classes => target_classes)
        controller.send(:ab_get_node_info, "xx-ab_Host_cbg-10r95_cb-#{custom_button.id}")
        expect(assigns(:resolve)[:new][:target_class]).to eq("Host")
      end

      it "loads role names from role IDs for display" do
        role1 = FactoryBot.create(:miq_user_role, :name => "TestRole1")
        role2 = FactoryBot.create(:miq_user_role, :name => "TestRole2")
        custom_button = FactoryBot.create(:custom_button,
                                          :applies_to_class => "Host",
                                          :name             => "Button With Roles",
                                          :visibility       => {:roles => [role1.id, role2.id]})
        target_classes = {}
        CustomButton.button_classes.each { |db| target_classes[ui_lookup(:model => db)] = db }
        controller.instance_variable_set(:@sb, :target_classes => target_classes)
        controller.send(:ab_get_node_info, "xx-ab_Host_cbg-10r95_cb-#{custom_button.id}")

        expect(assigns(:sb)[:user_roles]).to match_array(["TestRole1", "TestRole2"])
      end

      it "handles buttons with _ALL_ visibility" do
        custom_button = FactoryBot.create(:custom_button,
                                          :applies_to_class => "Host",
                                          :name             => "Button For All",
                                          :visibility       => {:roles => ["_ALL_"]})
        target_classes = {}
        CustomButton.button_classes.each { |db| target_classes[ui_lookup(:model => db)] = db }
        controller.instance_variable_set(:@sb, :target_classes => target_classes)
        controller.send(:ab_get_node_info, "xx-ab_Host_cbg-10r95_cb-#{custom_button.id}")

        expect(assigns(:sb)[:user_roles]).to eq([])
      end
    end
  end
end
