describe ConfigurationJobController do
  include CompressedIds

  let!(:user) { stub_user(:features => :all) }
  let(:job)   { FactoryGirl.create(:ansible_tower_job, :name => "testJob") }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  render_views

  describe '#show' do
    context "instances" do
      before do
        session[:settings] = {}
        get :show, :params => {:id => job.id}
      end

      it "renders the listnav" do
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_configuration_job")
      end

      it "links to ConfigurationJobController" do # instead of OrchestrationStackController
        extend QuadiconHelper
        extend ApplicationHelper
        allow(self).to receive(:url_for) do |opt|
          opt
        end

        url_for_options = url_for_db(quadicon_model_name(job), "show", job)

        expect(url_for_options[:controller]).to eq("configuration_job")
      end
    end
  end

  describe "#button" do
    it "handles configuration_job_tag" do
      expect(controller).to receive(:tag).and_call_original
      post :button, :params => { :pressed => "configuration_job_tag", :format => :js, :id => job.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles configuration_job_delete" do
      expect(controller).to receive(:handle_configuration_job_delete)
      post :button, :params => { :pressed => "configuration_job_delete", :format => :js, :id => job.id }
    end
  end

  describe "#tagging_edit" do
    let(:classification) do
      FactoryGirl.create(:classification, :name => "department", :description => "Department")
    end

    let(:tag1) do
      FactoryGirl.create(:classification_tag, :name => "tag1", :parent => classification)
    end

    let(:tag2) do
      FactoryGirl.create(:classification_tag, :name => "tag2", :parent => classification)
    end

    let(:edit) do
      {
        :key        => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job_edit_tags__#{job.id}",
        :tagging    => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job",
        :object_ids => [job.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    before do
      allow(job).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(job).and_return([tag1, tag2])
      session[:tag_db] = "ManageIQ::Providers::AnsibleTower::AutomationManager::Job"
      session[:edit] = edit
      session[:breadcrumbs] = [{:url => "configuration_job/show/#{job.id}"}, 'placeholder']
    end

    after(:each) do
      expect(response.status).to eq(200)
      expect(assigns(:edit)).to be_nil
    end

    it "cancels tags edit" do
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => job.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
    end

    it "save tags" do
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => job.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
    end
  end

  include_examples '#download_summary_pdf', :ansible_tower_job
end
