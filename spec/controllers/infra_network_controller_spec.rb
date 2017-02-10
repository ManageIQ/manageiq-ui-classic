describe InfraNetworkingController do
  include CompressedIds

  let!(:user) { stub_user(:features => :all) }

  let(:switch) { FactoryGirl.create(:switch, :name => 'test_switch1', :shared => 'true') }
  let(:host) { FactoryGirl.create(:host, :name => 'test_host1') }
  let(:ems_vmware) { FactoryGirl.create(:ems_vmware, :name => 'test_vmware') }
  let(:cluster) { FactoryGirl.create(:cluster, :name => 'test_cluster') }

  before { EvmSpecHelper.create_guid_miq_server_zone }

  describe "button" do
    it "builds tagging screen" do
      expect(controller).to receive(:tag).and_call_original
      post :button, :params => { :pressed => "infra_networking_tag", :format => :js, :id => switch.id }
      expect(assigns(:flash_array)).to be_nil
    end
  end

  describe '#explorer' do
    render_views

    before do
      session[:settings] = {:views => {}, :perpage => {:list => 5}}
    end

    it 'can render the explorer' do
      session[:sb] = {:active_accord => :infra_networking_accord}
      seed_session_trees('switch', :infra_networking_tree, 'root')
      get :explorer
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end

    it 'shows a switch in the list' do
      switch
      session[:sb] = {:active_accord => :infra_networking_accord}
      seed_session_trees('switch', :infra_networking_tree, 'root')

      get :explorer
      expect(response.body).to match(/{"text":\s*"test_switch1"}/)
    end

    it 'can render the second page of switches' do
      7.times do |i|
        FactoryGirl.create(:switch, :name => 'test_switch' % i, :shared => true)
      end
      session[:sb] = {:active_accord => :infra_networking_accord}
      seed_session_trees('switch', :infra_networking_tree, 'root')
      allow(controller).to receive(:current_page).and_return(2)
      get :explorer, :params => {:page => '2'}
      expect(response.status).to eq(200)
      expect(response.body).to include("<li>\n<span>\n6-7 of 7\n<input name='limitstart' type='hidden' value='0'>\n</span>\n</li>")
    end
  end

  describe "#tree_select" do
    [['All Distributed Switches', 'infra_networking_tree']].each do |elements, tree|
      it "renders list of #{elements} for #{tree} root node" do
        session[:settings] = {}
        seed_session_trees('infra_networking', tree.to_sym)

        post :tree_select, :params => { :id => 'root', :format => :js }
        expect(response.status).to eq(200)
      end
    end
  end

  describe "#tags_edit" do
    let(:switch) { FactoryGirl.create(:switch, :name => "testSwitch") }
    let(:classification) { FactoryGirl.create(:classification, :name => "department", :description => "Department") }
    let(:tag1) { FactoryGirl.create(:classification_tag, :name => "tag1", :parent => classification) }
    let(:tag2) { FactoryGirl.create(:classification_tag, :name => "tag2", :parent => classification) }

    before do
      allow(switch).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(switch).and_return([tag1, tag2])

      session[:tag_db] = "Switch"

      edit = {
        :key        => "Switch_edit_tags__#{switch.id}",
        :tagging    => "Switch",
        :object_ids => [switch.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }

      session[:edit] = edit
    end

    after do
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "infra_networking/show/#{switch.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => switch.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "infra_networking/show/#{switch.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => switch.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end
end
