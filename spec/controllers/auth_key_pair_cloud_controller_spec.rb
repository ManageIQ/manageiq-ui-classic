describe AuthKeyPairCloudController do
  let(:kp) { FactoryBot.create(:auth_key_pair_cloud) }
  let(:classification) { FactoryBot.create(:classification) }
  let(:tag1) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :parent => classification) }

  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    FactoryBot.create(:tagging, :tag => tag1.tag, :taggable => kp)
    FactoryBot.create(:tagging, :tag => tag2.tag, :taggable => kp)
  end

  describe "#tags_edit" do
    before do
      session[:tag_db] = "ManageIQ::Providers::CloudManager::AuthKeyPair"
      session[:edit] = {
        :key        => "ManageIQ::Providers::CloudManager::AuthKeyPair_edit_tags__#{kp.id}",
        :tagging    => "ManageIQ::Providers::CloudManager::AuthKeyPair",
        :object_ids => [kp.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "auth_key_pair_cloud_tag", :format => :js, :id => kp.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "auth_key_pair_cloud/show/#{kp.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => kp.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "auth_key_pair_cloud/show/#{kp.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => kp.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "parse error messages" do
    it "simplifies fog error message" do
      raw_msg = "Expected(200) <=> Actual(400 Bad Request)\nexcon.error.response\n  :body          => "\
                "\"{\\\"badRequest\\\": {\\\"message\\\": \\\"Keypair data is invalid: failed to generate "\
                "fingerprint\\\", \\\"code\\\": 400}}\"\n  :cookies       => [\n  ]\n  :headers       => {\n "\
                "\"Content-Length\"       => \"99\"\n    \"Content-Type\"         => \"application/json; "\
                "charset=UTF-8\"\n    \"Date\"                 => \"Mon, 02 May 2016 08:15:51 GMT\"\n ..."\
                ":reason_phrase => \"Bad Request\"\n  :remote_ip     => \"10....\"\n  :status        => 400\n  "\
                ":status_line   => \"HTTP/1.1 400 Bad Request\\r\\n\"\n"
      expect(subject.send(:get_error_message_from_fog, raw_msg)).to eq "Keypair data is invalid: failed to generate "\
                                                                       "fingerprint"
    end
  end

  describe '#show_list' do
    render_views

    it 'sets the lastaction correctly' do
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'ManageIQ::Providers::CloudManager::AuthKeyPair',
        :report_data_additional_options => {
          :model      => "ManageIQ::Providers::CloudManager::AuthKeyPair",
          :lastaction => 'show_list',
          :gtl_dbname => :authkeypaircloud
        }
      )

      get :show_list
      expect(response.status).to eq(200)
    end
  end

  describe '#button' do
    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => kp.id.to_s, :controller => 'auth_key_pair_cloud'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm_instance.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end
end
