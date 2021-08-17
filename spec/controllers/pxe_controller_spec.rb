describe PxeController do
  before do
    stub_user(:features => :all)
  end

  describe '#tree_select ' do
    it 'calls methods with x_node as param' do
      controller.params = {:id => 'root', :tree => :pxe_servers_tree}
      expect(controller).to receive(:get_node_info).with("root")
      expect(controller).to receive(:replace_right_cell).with(:nodetype => "root")
      controller.tree_select
    end
  end

  describe '#accordion_select ' do
    it 'calls methods with x_node as param' do
      controller.params = {:id => 'pxe_servers_accord', :tree => :pxe_servers_tree}
      allow(controller).to receive(:x_node).and_return('root')
      expect(controller).to receive(:get_node_info).with("root")
      expect(controller).to receive(:replace_right_cell).with(:nodetype => "root")
      controller.accordion_select
    end
  end

  describe 'x_button' do
    let!(:server) { EvmSpecHelper.local_miq_server }
    let(:pending_actions) { %w(pxe_image_tag windows_image_tag) }
    let(:allowed_actions) { PxeController::PXE_X_BUTTON_ALLOWED_ACTIONS.keys - pending_actions }

    before do
      ApplicationController.handle_exceptions = true
      login_as user_with_feature(%w(pxe_server_accord pxe_server_refresh) + allowed_actions)
    end
    describe 'corresponding methods are called for allowed actions' do
      PxeController::PXE_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          pending("Action hasn't been fully implemented with toolbar entries or features yet") if pending_actions.include?(action_name)
          expect(controller).to receive(method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end

    it "Pressing Refresh button should show display name in the flash message" do
      pxe = FactoryBot.create(:pxe_server)
      controller.params = {:id => pxe.id}
      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :pxe_tree => {:active_node => "ps-#{pxe.id}"}
                                       },
                                       :active_tree => :pxe_servers_tree)
      allow(controller).to receive(:get_node_info)
      allow(controller).to receive(:replace_right_cell)
      controller.send(:pxe_server_refresh)
      expect(assigns(:flash_array).first[:message]).to include("Refresh Relationships successfully initiated")
    end
  end

  describe "#tree_select" do
    before { login_as FactoryBot.create(:user_admin) }

    subject { post :tree_select, :params => {:id => 'root', :tree => 'pxe_servers_tree'} }

    render_views
    it do
      allow(controller).to receive(:data_for_breadcrumbs).and_return({})
      bypass_rescue
      is_expected.to have_http_status 200
    end
  end

  describe 'replace_right_cell' do
    it "Can build all the trees" do
      seed_session_trees('pxe', :pxe_tree, 'root')
      session_to_sb

      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderPxeServers),
          instance_of(TreeBuilderPxeImageTypes),
          instance_of(TreeBuilderPxeImageTypes),
          instance_of(TreeBuilderPxeCustomizationTemplates),
          instance_of(TreeBuilderIsoDatastores)
        )
      )
      expect(controller).to receive(:render)
      controller.send(:replace_right_cell, :replace_trees => %i(pxe_servers pxe_image_types customization_templates iso_datastores))
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:current_page) { 'current_page' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:pxe_lastaction   => lastaction,
                                                          :pxe_display      => display,
                                                          :pxe_current_page => current_page)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("PXE")
        expect(controller.instance_variable_get(:@layout)).to eq("pxe")
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
        controller.send(:set_session_data)

        expect(controller.session[:pxe_lastaction]).to eq(lastaction)
        expect(controller.session[:pxe_display]).to eq(display)
        expect(controller.session[:pxe_current_page]).to eq(current_page)
      end
    end
  end
end
