describe MiqAeToolsController do
  before do
    stub_user(:features => :all)
  end

  context "#form_field_changed" do
    it "resets target id to nil, when target class is <none>" do
      new = {
        :target_class => "EmsCluster",
        :target_id    => 1
      }
      controller.instance_variable_set(:@resolve, :throw_ready => true, :new => new)
      expect(controller).to receive(:render)
      controller.instance_variable_set(:@_params, :target_class => '', :id => 'new')
      controller.send(:form_field_changed)
      expect(assigns(:resolve)[:new][:target_class]).to eq('')
      expect(assigns(:resolve)[:new][:target_id]).to eq(nil)
    end

    it "resets target id to nil, when target class is Vm" do
      new = {
        :target_class => "EmsCluster",
        :target_id    => 1
      }
      controller.instance_variable_set(:@resolve, :throw_ready => true, :new => new)
      expect(controller).to receive(:render)
      controller.instance_variable_set(:@_params, :target_class => 'Vm', :id => 'new')
      controller.send(:form_field_changed)
      expect(assigns(:resolve)[:new][:target_class]).to eq('Vm')
      expect(assigns(:resolve)[:new][:target_id]).to eq(nil)
      expect(assigns(:resolve)[:targets].count).to eq(0)
    end
  end

  describe "#import_export" do
    include_context "valid session"

    let(:fake_domain) { double("MiqAeDomain", :name => "test_domain") }
    let(:fake_domain2) { double("MiqAeDomain", :name => "uneditable") }
    let(:tenant) do
      double(
        "Tenant",
        :editable_domains => [double(:name => "test_domain")]
      )
    end

    before do
      bypass_rescue
      allow(controller).to receive(:current_tenant).and_return(tenant)
      allow(MiqAeDomain).to receive(:all_unlocked).and_return([fake_domain, fake_domain2])
    end

    it "includes a list of importable domain options" do
      get :import_export

      expect(assigns(:importable_domain_options)).to eq([
                                                          ["<Same as import from>", nil],
                                                          %w(test_domain test_domain)
                                                        ])
    end
  end

  describe "#cancel_import" do
    include_context "valid session"

    let(:params) { {:import_file_upload_id => "123"} }
    let(:automate_import_service) { double("AutomateImportService") }

    before do
      bypass_rescue
      allow(AutomateImportService).to receive(:new).and_return(automate_import_service)
      allow(automate_import_service).to receive(:cancel_import)
    end

    it "cancels the import" do
      expect(automate_import_service).to receive(:cancel_import).with("123")
      post :cancel_import, :params => params, :xhr => true
    end

    it "returns a 200" do
      post :cancel_import, :params => params, :xhr => true
      expect(response.status).to eq(200)
    end

    it "returns the flash messages" do
      post :cancel_import, :params => params, :xhr => true
      expect(response.body).to eq([{:message => "Datastore import was cancelled or is finished", :level => :info}].to_json)
    end
  end

  describe "#automate_json" do
    include_context "valid session"

    let(:automate_import_json_serializer) { double("AutomateImportJsonSerializerService") }
    let(:import_file_upload) { double("ImportFileUpload") }
    let(:params) { {:import_file_upload_id => "123"} }

    before do
      bypass_rescue
      allow(AutomateImportJsonSerializerService).to receive(:new).and_return(automate_import_json_serializer)
      allow(ImportFileUpload).to receive(:find).with("123").and_return(import_file_upload)
      allow(automate_import_json_serializer).to receive(:serialize).with(import_file_upload).and_return("the json")
    end

    it "returns the expected json" do
      get :automate_json, :params => params, :xhr => true
      expect(response.body).to eq("the json")
    end

    it "returns a 500 error code for invalid file" do
      allow(automate_import_json_serializer).to receive(:serialize).with(import_file_upload).and_raise(StandardError)
      get :automate_json, :params => params, :xhr => true
      expect(response.status).to eq(500)
    end
  end

  describe "#import_automate_datastore" do
    include_context "valid session"

    let(:params) do
      {
        :import_file_upload_id          => "123",
        :selected_domain_to_import_from => "potato",
        :selected_domain_to_import_to   => "tomato",
        :selected_namespaces            => selected_namespaces
      }
    end

    before do
      bypass_rescue
    end

    context "when the selected namespaces is not nil" do
      let(:automate_import_service) { double("AutomateImportService") }
      let(:selected_namespaces) { ["datastore/namespace", "datastore/namespace/test"] }

      before do
        allow(ImportFileUpload).to receive(:where).with(:id => "123").and_return([import_file_upload])
        allow(AutomateImportService).to receive(:new).and_return(automate_import_service)
      end

      context "when the import file exists" do
        let(:import_file_upload) { double("ImportFileUpload") }
        let(:import_stats) do
          {
            :namespace => {:test => 2, :test2 => 2},
            :class     => {:test => 3, :test2 => 3},
            :instance  => {},
            :method    => {:test => 5, :test2 => 5},
          }
        end

        before do
          allow(automate_import_service).to receive(:import_datastore).and_return(import_stats)
        end

        it "imports the data" do
          expect(automate_import_service).to receive(:import_datastore).with(
            import_file_upload,
            "potato",
            "tomato",
            ["datastore", "datastore/namespace", "datastore/namespace/test"]
          )
          post :import_automate_datastore, :params => params, :xhr => true
        end

        it "returns with a 200 status" do
          post :import_automate_datastore, :params => params, :xhr => true
          expect(response.status).to eq(200)
        end

        it "returns the flash message" do
          post :import_automate_datastore, :params => params, :xhr => true
          expected_message = <<~MESSAGE
            Datastore import was successful.
            Namespaces updated/added: 4
            Classes updated/added: 6
            Instances updated/added: 0
            Methods updated/added: 10
          MESSAGE
          expect(response.body).to eq([{:message => expected_message.chomp, :level => :success}].to_json)
        end
      end

      context "when the import file does not exist" do
        let(:import_file_upload) { nil }

        it "returns with a 200 status" do
          post :import_automate_datastore, :params => params, :xhr => true
          expect(response.status).to eq(200)
        end

        it "returns the flash message" do
          post :import_automate_datastore, :params => params, :xhr => true
          expect(response.body).to eq(
            [{:message => "Error: Datastore import file upload expired", :level => :error}].to_json
          )
        end
      end
    end

    context "when the selected namepsaces is nil" do
      let(:selected_namespaces) { nil }

      it "returns with a 200 status" do
        post :import_automate_datastore, :params => params, :xhr => true
        expect(response.status).to eq(200)
      end

      it "returns the flash message" do
        post :import_automate_datastore, :params => params, :xhr => true
        expect(response.body).to eq(
          [{:message => "You must select at least one namespace to import", :level => :info}].to_json
        )
      end
    end
  end

  describe "#review_import" do
    include_context "valid session"

    let(:params) { {:import_file_upload_id => "123"} }

    before do
      session[:flash_msgs] = [{:message => 'the message'}]
      bypass_rescue
    end

    it "assigns the import file upload id" do
      get :review_import, :params => params
      expect(assigns(:import_file_upload_id)).to eq("123")
    end

    it "assigns the message" do
      get :review_import, :params => params
      expect(assigns(:message)).to include("the message")
    end
  end

  describe "#retrieve_git_datastore" do
    include_context "valid session"

    let(:params) do
      {
        :git_url        => git_url,
        :git_username   => "gitusername",
        :git_password   => "gitpassword",
        :git_verify_ssl => "gitverifyssl"
      }
    end

    context "when the git url is blank" do
      let(:git_url) { "" }

      it "responds with an error message" do
        post :retrieve_git_datastore, :params => params, :xhr => true
        expect(response.body).to eq({
          :message => {
            :message => "Please provide a valid git URL",
            :level   => :error
          }
        }.to_json)
      end
    end

    context "when the git url is not blank" do
      let(:git_url) { "http://www.example.com/" }

      context "when the import service is not available" do
        before do
          allow(GitBasedDomainImportService).to receive(:available?).and_return(false)
        end

        it "responds with an error message" do
          post :retrieve_git_datastore, :params => params, :xhr => true
          expect(response.body).to eq({
            :message => {
              :message => "Please enable the git owner role in order to import git repositories",
              :level   => :error
            }
          }.to_json)
        end
      end

      context "when the import service is available" do
        let(:git_repository_service) { double("GitRepositoryService") }

        before do
          allow(GitBasedDomainImportService).to receive(:available?).and_return(true)
          allow(GitRepositoryService).to receive(:new).and_return(git_repository_service)
        end

        context "when something goes wrong in the git repository service" do
          before do
            allow(git_repository_service).to receive(:setup).and_raise("Oopsies")
          end

          it "responds with an error message" do
            post :retrieve_git_datastore, :params => params, :xhr => true
            expect(response.body).to eq({
              :message => {
                :message => "Error during repository setup: Oopsies",
                :level   => :error
              }
            }.to_json)
          end
        end

        context "when everything works fine" do
          let(:git_repo) { double("GitRepository", :id => 123) }
          let(:git_based_domain_import_service) { double("GitBasedDomainImportService") }

          before do
            allow(git_repository_service).to receive(:setup).with(
              git_url,
              "gitusername",
              "gitpassword",
              "gitverifyssl"
            ).and_return(:git_repo_id => git_repo.id, :new_git_repo? => false)
            allow(GitBasedDomainImportService).to receive(:new).and_return(git_based_domain_import_service)
            allow(git_based_domain_import_service).to receive(:queue_refresh).with(123).and_return(321)
          end

          it "responds with task information" do
            post :retrieve_git_datastore, :params => params, :xhr => true
            expect(response.body).to eq({
              :task_id      => 321,
              :git_repo_id  => 123,
              :new_git_repo => false
            }.to_json)
          end
        end
      end
    end
  end

  describe "#check_git_task" do
    include_context "valid session"

    let(:params) do
      {:task_id => 123, :git_repo_id => 321, :new_git_repo => new_git_repo}
    end
    let(:new_git_repo) { false }

    let(:miq_task) { double("MiqTask", :state => state, :status => status, :message => "o noes") }
    let(:status) { "not ok" }

    before do
      allow(MiqTask).to receive(:find).with("123").and_return(miq_task)
    end

    context "when the task's state is not finished" do
      let(:state) { "potato" }

      it "renders the state as json" do
        get :check_git_task, :params => params, :xhr => true
        expect(response.body).to eq({:state => "potato"}.to_json)
      end
    end

    context "when the task's state is finished" do
      let(:state) { MiqTask::STATE_FINISHED }
      let(:git_repo) { double("GitRepository", :id => 321, :git_branches => git_branches, :git_tags => git_tags) }
      let(:git_branches) { [double("GitBranch", :name => "branches")] }
      let(:git_tags) { [double("GitTag", :name => "tags")] }

      before do
        allow(GitRepository).to receive(:find).with("321").and_return(git_repo)
      end

      context "when the status is 'Ok'" do
        let(:status) { "Ok" }

        it "responds with the git information" do
          get :check_git_task, :params => params, :xhr => true
          expect(response.body).to eq({
            :git_branches => ["branches"],
            :git_tags     => ["tags"],
            :git_repo_id  => 321,
            :success      => true,
            :message      => {
              :message => "Successfully found git repository, please choose a branch or tag",
              :level   => :success
            }
          }.to_json)
        end
      end

      context "when the status is not 'Ok'" do
        context "when the repository is new" do
          let(:new_git_repo) { true }

          before do
            allow(git_repo).to receive(:destroy)
          end

          it "destroys the git repository" do
            expect(git_repo).to receive(:destroy)
            get :check_git_task, :params => params, :xhr => true
          end

          it "responds with the error" do
            get :check_git_task, :params => params, :xhr => true
            expect(response.body).to eq({
              :success => false,
              :message => {
                :message => "Error during repository fetch: o noes",
                :level   => :error
              }
            }.to_json)
          end
        end

        context "when the repository is not new" do
          it "does not destroy the git repository" do
            expect(git_repo).to_not receive(:destroy)
            get :check_git_task, :params => params, :xhr => true
          end

          it "responds with the error" do
            get :check_git_task, :params => params, :xhr => true
            expect(response.body).to eq({
              :success => false,
              :message => {
                :message => "Error during repository fetch: o noes",
                :level   => :error
              }
            }.to_json)
          end
        end
      end
    end
  end

  describe "#upload_import_file" do
    include_context "valid session"

    before do
      bypass_rescue
    end

    shared_examples_for "MiqAeToolsController#upload_import_file that does not upload a file" do
      it "redirects with a warning message" do
        post :upload_import_file, :params => params, :xhr => true
        expect(response).to redirect_to(:action => :review_import)
        expect(session[:flash_msgs]).to match [a_hash_including(:message => "Use the Choose file button to locate an import file", :level => :warning)]
      end
    end

    context "when an upload file is given" do
      let(:automate_import_service) { double("AutomateImportService") }
      let(:params) { {:upload => {:file => upload_file}} }
      let(:upload_file) { fixture_file_upload("files/dummy_file.yml", "text/yml") }

      before do
        allow(AutomateImportService).to receive(:new).and_return(automate_import_service)
        allow(automate_import_service).to receive(:store_for_import).with("the yaml data\n").and_return(123)
      end

      it "stores the file for import" do
        expect(automate_import_service).to receive(:store_for_import).with("the yaml data\n")
        post :upload_import_file, :params => params, :xhr => true
      end

      it "redirects to review_import" do
        post :upload_import_file, :params => params, :xhr => true
        expect(response).to redirect_to(
          :action                => :review_import,
          :import_file_upload_id => 123,
        )
        expect(session[:flash_msgs]).to match [a_hash_including(:message => "Import file was uploaded successfully", :level => :success)]
      end
    end

    context "when the upload parameter is nil" do
      let(:params) { {} }

      it_behaves_like "MiqAeToolsController#upload_import_file that does not upload a file"
    end

    context "when an upload file is not given" do
      let(:params) { {:upload => {:file => nil}} }

      it_behaves_like "MiqAeToolsController#upload_import_file that does not upload a file"
    end
  end

  describe "#import_via_git" do
    let(:params) { {:git_repo_id => "123", :git_branch_or_tag => "branch_or_tag"} }
    let(:git_based_domain_import_service) { double("GitBasedDomainImportService") }

    before do
      allow(GitBasedDomainImportService).to receive(:new).and_return(git_based_domain_import_service)
    end

    context "when there are no errors while importing" do
      before do
        tenant_id = controller.current_tenant.id
        allow(git_based_domain_import_service).to receive(:import).with("123", "branch_or_tag", tenant_id)
      end

      it "responds with a success message" do
        post :import_via_git, :params => params, :xhr => true
        expect(response.body).to eq([{:message => "Imported from git", :level => :info}].to_json)
      end
    end

    context "when there are errors while importing" do
      before do
        tenant_id = controller.current_tenant.id
        allow(git_based_domain_import_service).to receive(:import).with("123", "branch_or_tag", tenant_id).and_raise(
          MiqException::Error, "kaboom"
        )
      end

      it "responds with an error message" do
        post :import_via_git, :params => params, :xhr => true
        expect(response.body).to eq(
          [{:message => "Error: import failed: kaboom", :level => :error}].to_json
        )
      end
    end
  end
end
