describe MiqPolicyController do
  before do
    stub_user(:features => :all)
  end
  context "::PolicyProfiles" do
    context "#profile_edit" do
      render_views

      before do
        @policy_profile = FactoryBot.create(:miq_policy_set, :description => "foo")
        @policy1 = FactoryBot.create(:miq_policy, :towhat => "ContainerGroup", :mode => "compliance")
        @policy2 = FactoryBot.create(:miq_policy, :towhat => "ContainerGroup", :mode => "compliance")
        @policy_profile.add_member(@policy1)
        @policy_profile.add_member(@policy2)
      end

      it "Successfully removes a Policy from a Policy Profile" do
        new = {:description => "foo", :policies => {@policy2.name => @policy2.id}}
        current = {:description => "foo", :policies => {@policy1.name => @policy1.id, @policy2.name => @policy2.id}}

        controller.instance_variable_set(:@edit, :new        => new,
                                                 :current    => current,
                                                 :key        => "profile_edit__#{@policy_profile.id}",
                                                 :profile_id => @policy_profile.id)
        session[:edit] = assigns(:edit)
        allow(controller).to receive(:replace_right_cell)
        controller.params = {:button => "save", :id => @policy_profile.id}
        expect(@policy_profile.members.count).to eq(2)
        controller.profile_edit
        expect(assigns(:flash_array).first[:message]).to include("Policy Profile \"#{@policy_profile.description}\" was saved")
        @policy_profile.reload
        expect(@policy_profile.members.count).to eq(1)
      end
    end
  end
end
