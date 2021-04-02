describe MiqPolicyController do
  before do
    stub_user(:features => :all)
  end

  describe '#set_search_text' do
    context 'clearing search text' do
      let(:search) { "some_text" }
      let(:tree) { :any_tree }

      before do
        controller.params = {:action => 'search_clear'}
        controller.instance_variable_set(:@sb, :active_tree => tree, :pol_search_text => {tree => search})
        controller.instance_variable_set(:@search_text, search)
      end

      it 'clears search text from the Search form' do
        controller.send(:set_search_text)
        expect(controller.instance_variable_get(:@sb)[:pol_search_text][tree]).to be(nil)
        expect(controller.instance_variable_get(:@search_text)).to be(nil)
      end
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:current_page) { 'current_page' }
    let(:layout) { 'miq_policy' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:miq_policy_lastaction   => lastaction,
                                                          :miq_policy_display      => display,
                                                          :miq_policy_current_page => current_page,
                                                          :layout                  => layout)
        allow(controller).to receive(:alert_build_pulldowns).and_return(nil)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Policies")
        expect(controller.instance_variable_get(:@layout)).to eq(layout)
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
        expect(controller.instance_variable_get(:@current_page)).to eq(current_page)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.instance_variable_set(:@current_page, current_page)
        controller.instance_variable_set(:@layout, layout)
        controller.send(:set_session_data)

        expect(controller.session[:miq_policy_lastaction]).to eq(lastaction)
        expect(controller.session[:miq_policy_display]).to eq(display)
        expect(controller.session[:miq_policy_current_page]).to eq(current_page)
        expect(controller.session[:layout]).to eq(layout)
      end
    end
  end

  describe "#show_list" do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  describe "#show" do
    it "render show" do
      policy = FactoryBot.create(:miq_policy)
      get(:show, :params => {:id => policy.id})
      expect(response.status).to eq(200)
      expect(controller.instance_variable_get(:@record)).to eq(policy)
    end
  end

  context "#edit" do
    before do
      @policy = FactoryBot.create(:miq_policy, :description => "Test_Policy")
      controller.instance_variable_set(:@lastaction, "show")
    end

    it "first time in" do
      controller.edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test reset button" do
      controller.params = {:button => "reset", :id => @policy.id}
      allow(controller).to receive(:drop_breadcrumb)
      expect(controller).to receive(:javascript_redirect).with(:action       => 'edit',
                                                               :id            => @policy.id,
                                                               :flash_msg     => _("All changes have been reset"),
                                                               :flash_warning => true)
      controller.send(:edit)
    end

    it "Test cancel button" do
      controller.params = {:button => "cancel", :id => @policy.id}
      allow(controller).to receive(:drop_breadcrumb)
      edit = {:key => "miq_policy_edit__#{@policy.id}", :new => {:description => @policy.description} }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      expect(controller).to receive(:javascript_redirect).with(:action    => 'show',
                                                               :flash_msg => _("Edit of Policy \"%{name}\" was cancelled by the user") % {:name => @policy.description},
                                                               :id        => @policy.id)
      controller.send(:edit)
    end

    it "Shows flash message when saving invalid policy record" do
      edit = {:key => "miq_policy_edit__#{@policy.id}", :new => {:description => "foo_policy",
                                                                 :towhat      => "Host",
                                                                 :expression  => {">" => {"count" => "ContainerGroup.advanced_settings", "value" => "1"}}}}
      controller.instance_variable_set(:@edit, edit)
      allow(controller).to receive(:drop_breadcrumb)
      session[:edit] = assigns(:edit)
      controller.params = {:id => @policy.id, :button => "save"}
      expect(controller).to receive(:javascript_flash)
      controller.edit
    end

    it "Test saving a policy record" do
      edit = {:key => "miq_policy_edit__#{@policy.id}", :new => {:description => "foo_policy",
                                                                 :towhat      => "Host",
                                                                 :mode        => "control",
                                                                 :expression  => {">" => {"count" => "ContainerGroup.advanced_settings", "value" => "1"}}}}
      controller.instance_variable_set(:@edit, edit)
      allow(controller).to receive(:drop_breadcrumb)
      session[:edit] = assigns(:edit)
      controller.params = {:id => @policy.id, :button => "save"}
      expect(controller).to receive(:javascript_redirect).with(:action    => 'show',
                                                               :flash_msg => "Policy \"foo_policy\" was saved",
                                                               :id        => @policy.id)
      controller.edit
    end
  end

    describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'Policies' on list screen" do
      get :show_list

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Policies")
    end
  end
end
