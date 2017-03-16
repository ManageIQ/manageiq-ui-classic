describe AuthKeyPairCloudController do
  let(:user) { stub_user(:features => :all) }

  describe "#button" do
    let(:pair) { FactoryGirl.create(:auth_key_pair_cloud, :name => "auth-key-pair-cloud-00") }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      allow(pair).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
    end

    it "builds tagging screen" do
      expect(controller).to receive(:tag)
      post :button, :params => { :pressed => "auth_key_pair_cloud_tag", :format => :js, :id => pair.id }
      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it 'handles auth_key_pair_cloud_delete' do
      expect(controller).to receive(:handle_auth_key_pair_cloud_delete)
      post :button, :params => { :pressed => "auth_key_pair_cloud_delete", :format => :js, :id => pair.id }
    end

    it 'handles auth_key_pair_cloud_new' do
      expect(controller).to receive(:handle_auth_key_pair_cloud_new)
      post :button, :params => { :pressed => "auth_key_pair_cloud_new", :format => :js, :id => pair.id }
    end
  end

  context "#tags_edit" do
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      @kp = FactoryGirl.create(:auth_key_pair_cloud, :name => "auth-key-pair-cloud-01")
      allow(@kp).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryGirl.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@kp).and_return([@tag1, @tag2])
      session[:tag_db] = "ManageIQ::Providers::CloudManager::AuthKeyPair"
      edit = {
        :key        => "ManageIQ::Providers::CloudManager::AuthKeyPair_edit_tags__#{@kp.id}",
        :tagging    => "ManageIQ::Providers::CloudManager::AuthKeyPair",
        :object_ids => [@kp.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "auth_key_pair_cloud/show/#{@kp.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @kp.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "auth_key_pair_cloud/show/#{@kp.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @kp.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  context "#parse error messages" do
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
end
