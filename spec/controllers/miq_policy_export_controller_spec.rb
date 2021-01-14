describe MiqPolicyExportController do
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

    shared_examples_for "MiqPolicyExportController#import" do
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

      it_behaves_like "MiqPolicyExportController#import"

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

      it_behaves_like "MiqPolicyExportController#import"

      it "cancels the import" do
        expect(miq_policy_import_service).to receive(:cancel_import).with("123")
        post :import, :params => params
      end
    end
  end

  describe "#upload" do
    include_context "valid session"

    shared_examples_for "MiqPolicyExportController#upload that cannot locate an import file" do
      it "redirects with a cannot locate import file error message" do
        post :upload, :params => params
        expect(response).to redirect_to(:action => "index", :dbtype => "dbtype")
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
                :action => "index",
                :dbtype => "dbtype",
              )
              expect(session[:flash_msgs]).to match [a_hash_including(:message => "Error during 'Policy Import': message", :level => :error)]
            end
          end
        end

        context "when the file upload parameter does not respond to read" do
          let(:file_contents) { "does not respond to read" }

          it_behaves_like "MiqPolicyExportController#upload that cannot locate an import file"
        end
      end

      context "when there is not a file upload parameter" do
        let(:file_contents) { nil }

        it_behaves_like "MiqPolicyExportController#upload that cannot locate an import file"
      end
    end

    context "when there is not an upload parameter" do
      let(:upload) { nil }

      it_behaves_like "MiqPolicyExportController#upload that cannot locate an import file"
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:layout) { 'miq_policy_export' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:miq_policy_export_lastaction   => lastaction,
                                                          :layout                         => layout)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Import / Export")
        expect(controller.instance_variable_get(:@layout)).to eq(layout)
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@layout, layout)
        controller.send(:set_session_data)

        expect(controller.session[:miq_policy_export_lastaction]).to eq(lastaction)
        expect(controller.session[:layout]).to eq(layout)
      end
    end
  end

  describe "breadcrumbs" do
    before { EvmSpecHelper.local_miq_server }

    it "shows 'import / export' on export screen" do
      get :export

      expect(controller.data_for_breadcrumbs.pluck(:title)[1]).to eq("Import / Export")
    end
  end
end
