describe ConfigurationJobController do
  let!(:user) { stub_user(:features => :all) }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  render_views

  describe '#show' do
    context "instances" do
      let(:record) { FactoryBot.create(:ansible_tower_job) }

      before do
        session[:settings] = {
        }
        get :show, :params => {:id => record.id}
      end

      it "renders show" do
        expect(response.status).to eq(200)
      end

      it "links to ConfigurationJobController" do # instead of OrchestrationStackController
        extend QuadiconHelper
        extend ApplicationHelper
        allow(self).to receive(:url_for) do |opt|
          opt
        end

        url_for_options = url_for_db(record.class.db_name, "show", record)

        expect(url_for_options[:controller]).to eq("configuration_job")
      end
    end
  end

  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @cj = FactoryBot.create(:ansible_tower_job, :name => "testJob")
      allow(@cj).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@cj).and_return([@tag1, @tag2])
      session[:tag_db] = "ManageIQ::Providers::AnsibleTower::AutomationManager::Job"
      edit = {
        :key        => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job_edit_tags__#{@cj.id}",
        :tagging    => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job",
        :object_ids => [@cj.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "configuration_job_tag", :format => :js, :id => @cj.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "configuration_job/show/#{@cj.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @cj.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "configuration_job/show/#{@cj.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @cj.id, :data => get_tags_json([@tag1, @tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  include_examples '#download_summary_pdf', :ansible_tower_job
end
