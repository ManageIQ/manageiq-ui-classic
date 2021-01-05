describe MiqPolicySetController do
  before do
    stub_user(:features => :all)
  end

  context "show_list" do
    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  context "#edit" do
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
      controller.instance_variable_set(:@lastaction, "show")
      controller.params = {:button => "save", :id => @policy_profile.id}
      expect(@policy_profile.members.count).to eq(2)
      page = double('page')
      allow(page).to receive(:<<).with(any_args)
      expect(page).to receive(:redirect_to).with({:action=>"show", :controller=>"miq_policy_set", :flash_msg=>"Policy Profile \"foo\" was saved", :id=>@policy_profile.id})
      expect(controller).to receive(:render).with(:update).and_yield(page)
      controller.edit
      @policy_profile.reload
      expect(@policy_profile.members.count).to eq(1)
    end
  end
end
