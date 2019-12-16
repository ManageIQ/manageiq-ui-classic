describe InfraNetworkingController do
  let!(:switch) { FactoryBot.create(:switch, :name => 'test_switch1', :shared => 'true') }
  let(:classification) { FactoryBot.create(:classification, :name => "department", :description => "Department") }
  let(:tag1) { FactoryBot.create(:classification_tag, :name   => "tag1", :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :name   => "tag2", :parent => classification) }
  let(:ems) { FactoryBot.create(:ems_vmware) }
  let(:cluster) { FactoryBot.create(:ems_cluster, :ems_id => ems.id) }

  before do
    stub_user(:features => :all)
    FactoryBot.create(:tagging, :tag => tag1.tag, :taggable => switch)
    FactoryBot.create(:tagging, :tag => tag2.tag, :taggable => switch)
  end

  describe 'render_views' do
    render_views

    before { EvmSpecHelper.create_guid_miq_server_zone }

    describe '#explorer' do
      before do
        session[:settings] = {:views => {}, :perpage => {:list => 5}}
        session[:sb] = {:active_accord => :infra_networking_accord}
        seed_session_trees('switch', :infra_networking_tree, 'root')
      end

      it 'can render the explorer' do
        get :explorer

        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
      end

      it 'shows a switch in the list' do
        get :explorer

        expect(response.body).to include("modelName: 'Switch'")
        expect(response.body).to include("activeTree: 'infra_networking_tree'")
        expect(response.body).to include("gtlType: 'list'")
        expect(response.body).to include("isExplorer: 'true' === 'true' ? true : false")
        expect(response.body).to include("showUrl: '/infra_networking/x_show/'")
      end
    end

    describe "#tree_select" do
      before do
        session[:settings] = {}
        seed_session_trees('infra_networking', :infra_networking_tree)
      end

      it "renders list of All Distributed Switches for infra_networking_tree root node" do
        post :tree_select, :params => { :id => 'root', :format => :js }

        expect(response.status).to eq(200)
      end

      it "renders textual summary for an infrastructure switch" do
        post :tree_select, :params => { :id => "sw-#{switch.id}", :tree => :infra_networking_tree, :format => :js }

        expect(response.status).to eq(200)
        expect(response.body).to include('Department')
        expect(response.body).to include(tag1.description)
        expect(response.body).to include(tag2.description)
      end

      it 'renders the network switch center toolbar' do
        nodeid = [ems, cluster, switch].map { |item| TreeNode.new(item).key }.join('_')
        expect(ApplicationHelper::Toolbar::InfraNetworkingCenter).to receive(:definition).and_call_original.at_least(:once)
        post :tree_select, :params => { :id => nodeid }
      end

      context 'right cell text' do
        let(:text) { 'switch' }

        before do
          allow(controller).to receive(:load_or_clear_adv_search)
          allow(controller).to receive(:render)
          controller.instance_variable_set(:@r, {})
          controller.instance_variable_set(:@sb, :active_tree => :infra_networking_tree)
          controller.params = {:search_text => text, :id => 'root'}
        end

        it 'updates title of the page according to the search text' do
          controller.send(:tree_select)
          expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Switches (Names with \"#{text}\")")
        end
      end
    end
  end

  describe "#tags_edit" do
    before do
      session[:tag_db] = "Switch"
      session[:edit] = {
        :key            => "Switch_edit_tags__#{switch.id}",
        :tagging        => "Switch",
        :object_iswitch => [switch.id],
        :current        => {:assignments => []},
        :new            => {:assignments => [tag1.id, tag2.id]}
      }
      session[:breadcrumbs] = [{:url => "infra_networking/show/#{switch.id}"}, 'placeholder']
    end

    it "build switch tagging screen" do
      post :x_button, :params => { :pressed => "infra_networking_tag", :format => :js, :id => switch.id }
      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => switch.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => switch.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe '#rebuild_toolbars' do
    let(:presenter) { instance_double("ExplorerPresenter") }

    before do
      allow(ExplorerPresenter).to receive(:new).and_return(presenter)
      allow(presenter).to receive(:hide)
      allow(presenter).to receive(:reload_toolbars)
      allow(presenter).to receive(:set_visibility)
      allow(presenter).to receive(:[]=)
      controller.instance_variable_set(:@nodetype, 'sw')
      controller.instance_variable_set(:@record, switch)
      controller.instance_variable_set(:@sb, {})
    end

    it 'does not display Search in Switch summary screen' do
      expect(controller).to receive(:display_adv_searchbox).and_return(false)
      controller.send(:rebuild_toolbars, true, presenter)
    end
  end
end
