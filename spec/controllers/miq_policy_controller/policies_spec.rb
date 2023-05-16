describe MiqPolicyController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
  end
  context "::Policies" do
    context "#edit" do
      render_views

      before do
        FactoryBot.create(:miq_event_definition, :name => "containergroup_compliance_check")
        FactoryBot.create(:miq_action, :name => "compliance_failed")
        controller.instance_variable_set(:@lastaction, "show_list")
      end

      it "Policy is added" do
        new = {}
        new[:mode] = "compliance"
        new[:description] = "foo_policy"
        new[:towhat] = "ContainerGroup"
        new[:description] = "Test_description"
        new[:expression] = {">" => {"count" => "ContainerGroup.advanced_settings", "value" => "1"}}
        controller.instance_variable_set(:@edit, :new     => new,
                                                 :current => new,
                                                 :typ     => "basic",
                                                 :key     => "miq_policy_edit__new")
        session[:edit] = assigns(:edit)
        controller.params = {:button => "add"}
        allow(controller).to receive(:javascript_redirect)
        controller.edit
        expect(response.status).to eq(200)
      end

      it "Renders the control policy creation form correctly" do
        session[:edit] = {:new => {:mode => "compliance", :towhat => "ContainerGroup"}}
        post :new
        expect(response).to render_template("miq_policy/new")
      end
    end
  end
end
