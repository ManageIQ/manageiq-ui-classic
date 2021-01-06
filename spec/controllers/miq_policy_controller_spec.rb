describe MiqPolicyController do
  before do
    stub_user(:features => :all)
  end

  describe '#explorer' do
    it 'renders explorer' do
      post :explorer
      expect(response).to render_template('explorer')
      flash_messages = controller.instance_variable_get(:@flash_array)
      expect(flash_messages).to be_nil
    end
  end

  describe '#tree_select' do
    [
      # [tree_sym, node, partial_name]
      [:policy_tree, 'root', 'miq_policy/_policy_folders'],
    ].each do |tree_sym, node, partial_name|
      it "renders #{partial_name} when #{tree_sym} tree #{node} node is selected" do
        session[:sandboxes] = {"miq_policy" => {:active_tree => tree_sym}}
        session[:settings] ||= {}

        post :tree_select, :params => { :id => node, :format => :js }
        expect(response).to render_template(partial_name)
        expect(response.status).to eq(200)
      end
    end
  end

  describe '#replace_right_cell' do
    it 'should reload policy tree when reload_trees contains :policy_tree' do
      allow(controller).to receive(:params).and_return(:action => 'whatever')
      controller.instance_eval { @sb = {:active_tree => :policy_tree} }
      allow(controller).to receive(:render).and_return(nil)
      presenter = ExplorerPresenter.new(:active_tree => :policy_tree)

      controller.send(:replace_right_cell, :nodetype => 'root', :replace_trees => [:policy], :presenter => presenter)
      expect(presenter[:reload_trees]).to have_key(:policy_tree)
    end

    it 'should not hide center toolbar while doing searches' do
      allow(controller).to receive(:params).and_return(:action => 'x_search_by_name')
      controller.instance_eval { @sb = {:active_tree => :action_tree} }
      controller.instance_eval { @edit = {:new => {:expression => {"???" => "???", :token => 1}}} }
      allow(controller).to receive(:render).and_return(nil)
      presenter = ExplorerPresenter.new(:active_tree => :action_tree)

      controller.send(:replace_right_cell, :nodetype => 'root', :replace_trees => [:action], :presenter => presenter)
      expect(presenter[:set_visible_elements][:toolbar]).to be_truthy
    end

    it 'should change header' do
      allow(controller).to receive(:params).and_return(:action => 'whatever')
      controller.instance_eval { @sb = {:active_tree => :alert_profile_tree} }
      allow(controller).to receive(:render).and_return(nil)
      presenter = ExplorerPresenter.new(:active_tree => :alert_profile_tree)
      controller.send(:get_node_info, 'ap_xx-Storage')
      presenter[:right_cell_text] = 'foo'
      controller.send(:replace_right_cell, :nodetype => 'xx', :replace_trees => [:alert_profile], :presenter => presenter)

      expect(presenter[:right_cell_text]).not_to equal('foo')
      expect(presenter[:right_cell_text]).to_not be_nil
    end

    context 'searching text' do
      let(:search) { "some_text" }

      before do
        allow(controller).to receive(:params).and_return(:action => 'x_search_by_name')
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@sb, tree)
        controller.instance_variable_set(:@search_text, search)
      end

      subject { controller.instance_variable_get(:@right_cell_text) }

      context 'policy profiles root node' do
        let(:tree) { {:active_tree => :policy_profile_tree} }

        it 'updates right cell text according to search text' do
          controller.send(:replace_right_cell, :nodetype => 'root')
          expect(subject).to eq("All Policies (Names with \"#{search}\")")
        end
      end
    end
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

  describe 'x_button' do
    before do
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      MiqPolicyController::POLICY_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          expect(controller).to receive(method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:current_page) { 'current_page' }
    let(:layout) { 'layout' }

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

  describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'explorer' on explorer screen" do
      get :explorer

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Explorer")
    end
  end
end
