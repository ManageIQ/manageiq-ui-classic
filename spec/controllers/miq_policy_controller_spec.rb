describe MiqPolicyController do
  before do
    stub_user(:features => :all)
  end

  describe "#import" do
    include_context "valid session"

    let(:params) { {:import_file_upload_id => 123, :commit => commit} }
    let(:miq_policy_import_service) { double("MiqPolicyImportService") }

    before do
      allow(MiqPolicyImportService).to receive(:new).and_return(miq_policy_import_service)
    end

    shared_examples_for "MiqPolicyController#import" do
      it "assigns the import file upload id" do
        post :import, :params => params
        expect(assigns(:import_file_upload_id)).to eq("123")
      end
    end

    context "when the commit parameter is import" do
      let(:commit) { "import" }

      before do
        allow(miq_policy_import_service).to receive(:import_policy)
      end

      it_behaves_like "MiqPolicyController#import"

      it "imports a policy" do
        expect(miq_policy_import_service).to receive(:import_policy).with("123")
        post :import, :params => params
      end
    end

    context "when the commit parameter is cancel" do
      let(:commit) { "cancel" }

      before do
        allow(miq_policy_import_service).to receive(:cancel_import)
      end

      it_behaves_like "MiqPolicyController#import"

      it "cancels the import" do
        expect(miq_policy_import_service).to receive(:cancel_import).with("123")
        post :import, :params => params
      end
    end
  end

  describe "#upload" do
    include_context "valid session"

    shared_examples_for "MiqPolicyController#upload that cannot locate an import file" do
      it "redirects with a cannot locate import file error message" do
        post :upload, :params => params
        expect(response).to redirect_to(:action => "export", :dbtype => "dbtype")
        expect(session[:flash_msgs]).to match [a_hash_including(:message => "Use the Choose file button to locate an Import file", :level => :error)]
      end
    end

    let(:params) { {:dbtype => "dbtype", :upload => upload} }

    context "when there is an upload parameter" do
      let(:upload) { {:file => file_contents} }

      context "when there is a file upload parameter" do
        context "when the file upload parameter responds to read" do
          let(:file_contents) do
            fixture_file_upload("files/dummy_file.yml", "text/yml")
          end

          let(:miq_policy_import_service) { double("MiqPolicyImportService") }

          before do
            allow(MiqPolicyImportService).to receive(:new).and_return(miq_policy_import_service)
          end

          context "when there is not an error while importing" do
            let(:import_file_upload) { FactoryBot.create(:import_file_upload) }

            before do
              allow(miq_policy_import_service).to receive(:store_for_import).and_return(import_file_upload)
            end

            it "sets the sandbox hide variable to true" do
              post :upload, :params => params
              expect(assigns(:sb)[:hide]).to be_truthy
            end

            it "imports a policy" do
              expect(miq_policy_import_service).to receive(:store_for_import).with(an_instance_of(ActionDispatch::Http::UploadedFile))
              post :upload, :params => params
            end

            it "redirects to import with the import_file_upload_id" do
              post :upload, :params => params
              expect(response).to redirect_to(:action => "import", :dbtype => "dbtype", :import_file_upload_id => import_file_upload.id)
            end
          end

          context "when there is an error while importing" do
            before do
              allow(miq_policy_import_service).to receive(:store_for_import)
                .with(an_instance_of(ActionDispatch::Http::UploadedFile)).and_raise(StandardError.new("message"))
            end

            it "redirects to export with an error message" do
              post :upload, :params => params
              expect(response).to redirect_to(
                :action => "export",
                :dbtype => "dbtype",
              )
              expect(session[:flash_msgs]).to match [a_hash_including(:message => "Error during 'Policy Import': message", :level => :error)]
            end
          end
        end

        context "when the file upload parameter does not respond to read" do
          let(:file_contents) { "does not respond to read" }

          it_behaves_like "MiqPolicyController#upload that cannot locate an import file"
        end
      end

      context "when there is not a file upload parameter" do
        let(:file_contents) { nil }

        it_behaves_like "MiqPolicyController#upload that cannot locate an import file"
      end
    end

    context "when there is not an upload parameter" do
      let(:upload) { nil }

      it_behaves_like "MiqPolicyController#upload that cannot locate an import file"
    end
  end

  describe '#explorer' do
    context 'when profile param present, but non-existent' do
      it 'renders explorer with flash message' do
        post :explorer, :params => { :profile => 42 }
        expect(response).to render_template('explorer')
        flash_messages = controller.instance_variable_get(:@flash_array)
        expect(flash_messages.find { |m| m[:message] == 'Policy Profile no longer exists' }).not_to be_nil
      end
    end

    context 'when profile param not present' do
      it 'renders explorer w/o flash message' do
        post :explorer
        expect(response).to render_template('explorer')
        flash_messages = controller.instance_variable_get(:@flash_array)
        expect(flash_messages).to be_nil
      end
    end

    context 'when profile param is valid' do
      it 'renders explorer w/o flash and assigns to x_node' do
        profile = FactoryBot.create(:miq_policy_set)
        allow(controller).to receive(:get_node_info).and_return(true)
        post :explorer, :params => { :profile => profile.id }
        expect(response).to render_template('explorer')
        flash_messages = controller.instance_variable_get(:@flash_array)
        expect(flash_messages).to be_nil
        expect(controller.x_node).to eq("pp-#{profile.id}")
      end
    end
  end

  describe '#tree_select' do
    [
      # [tree_sym, node, partial_name]
      [:policy_profile_tree, 'root', 'miq_policy/_profile_list'],
      [:policy_tree, 'root', 'miq_policy/_policy_folders'],
      [:event_tree, 'root', 'miq_policy/_event_list'],
      [:condition_tree, 'root', 'miq_policy/_condition_folders'],
      [:action_tree, 'root', 'miq_policy/_action_list'],
      [:alert_profile_tree, 'root', 'miq_policy/_alert_profile_folders'],
      [:alert_tree, 'root', 'miq_policy/_alert_list'],
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
        controller.instance_variable_set(:@conditions, {})
        controller.instance_variable_set(:@sb, tree)
        controller.instance_variable_set(:@search_text, search)
      end

      subject { controller.instance_variable_get(:@right_cell_text) }

      context 'policy profiles root node' do
        let(:tree) { {:active_tree => :policy_profile_tree} }

        it 'updates right cell text according to search text' do
          controller.send(:replace_right_cell, :nodetype => 'root')
          expect(subject).to eq("All Policy Profiles (Names with \"#{search}\")")
        end
      end

      context 'conditions node' do
        let(:tree) { {:active_tree => :condition_tree, :folder => "host"} }

        it 'updates right cell text according to search text' do
          controller.send(:replace_right_cell, :nodetype => 'xx')
          expect(subject).to eq("All Host / Node Conditions (Names with \"#{search}\")")
        end
      end
    end
  end

  describe '#set_search_text' do
    context 'clearing search text' do
      let(:search) { "some_text" }
      let(:tree) { :any_tree }

      before do
        controller.params = {:action => 'adv_search_text_clear'}
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
    let(:server_options) { 'server options' }
    let(:layout) { 'layout' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:miq_policy_lastaction   => lastaction,
                                                          :miq_policy_display      => display,
                                                          :miq_policy_current_page => current_page,
                                                          :server_options          => server_options,
                                                          :layout                  => layout)
        allow(controller).to receive(:alert_build_pulldowns).and_return(nil)
        allow(controller.request).to receive(:parameters).and_return('action' => 'wait_for_task')
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Policies")
        expect(controller.instance_variable_get(:@layout)).to eq(layout)
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
        expect(controller.instance_variable_get(:@current_page)).to eq(current_page)
        expect(controller.instance_variable_get(:@server_options)).to eq(server_options)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.instance_variable_set(:@current_page, current_page)
        controller.instance_variable_set(:@layout, layout)
        controller.instance_variable_set(:@server_options, server_options)
        controller.send(:set_session_data)

        expect(controller.session[:miq_policy_lastaction]).to eq(lastaction)
        expect(controller.session[:miq_policy_display]).to eq(display)
        expect(controller.session[:miq_policy_current_page]).to eq(current_page)
        expect(controller.session[:layout]).to eq(layout)
        expect(controller.session[:server_options]).to eq(server_options)
      end
    end
  end

  context 'removing conditions' do
    let(:condition) { FactoryBot.create(:condition) }
    let(:policy) { FactoryBot.create(:miq_policy, :name => "test_policy", :conditions => [condition]) }

    before do
      login_as FactoryBot.create(:user, :features => 'condition_remove')
      controller.params = {:policy_id => policy.id, :id => condition.id}
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:x_node).and_return("pp_pp-1r36_p-#{policy.id}_co-#{condition.id}")
    end

    it 'removes condition successfully' do
      expect(controller).to receive(:replace_right_cell)
      controller.send(:condition_remove)
      policy.reload
      expect(assigns(:flash_array).first[:message]).to include("has been removed from Policy")
      expect(policy.conditions).to eq([])
    end
  end

  describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'explorer' on explorer screen" do
      get :explorer

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Explorer")
    end

    it "shows 'simulation' on rsop screen" do
      get :rsop

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Simulation")
    end

    it "shows 'import / export' on export screen" do
      get :export

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Import / Export")
    end

    it "shows 'log' on log screen" do
      get :log

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Log")
    end
  end
end
