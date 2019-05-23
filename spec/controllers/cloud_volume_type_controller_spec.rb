describe CloudVolumeTypeController do
  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @volume_type = FactoryBot.create(:cloud_volume_type, :name => "cloud-volume-type-01")
      allow(@volume_type).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = Classification.find_by_name("department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@volume_type).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudVolumeType"
      edit = {
        :key        => "CloudVolumeType_edit_tags__#{@volume_type.id}",
        :tagging    => "CloudVolumeType",
        :object_ids => [@volume_type.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => {:pressed => "cloud_volume_type_tag", :format => :js, :id => @volume_type.id}
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_volume_type/show/#{@volume_type.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "cancel", :format => :js, :id => @volume_type.id}
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_volume_type/show/#{@volume_type.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "save", :format => :js, :id => @volume_type.id, :data => get_tags_json([@tag1, @tag2])}
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @volume_type = FactoryBot.create(:cloud_volume_type)
      login_as FactoryBot.create(:user, :features => "cloud_volume_type_show")
    end

    subject do
      get :show, :params => {:id => @volume_type.id}
    end

    context "render listnav partial" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_cloud_volume_type")
      end
    end
  end

  describe "#show_list" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @volume_type = FactoryBot.create(:cloud_volume_type)
      login_as FactoryBot.create(:user, :features => "cloud_volume_type_show_list")
    end

    subject do
      get :show_list, :params => {}
    end

    context "render list" do
      render_views

      it "return correct http response code" do
        is_expected.to have_http_status 200
      end

      it "render view for list of volume types" do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name      => 'CloudVolumeType',
          :parent_id       => nil,
          :explorer        => nil,
          :gtl_type_string => "list"
        )

        get :show_list
      end

      it 'renders the correct toolbar' do
        expect(ApplicationHelper::Toolbar::CloudVolumeTypesCenter).to receive(:definition).and_call_original
        post :show_list
      end
    end
  end

  describe '#report_data' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:volume_type) { FactoryBot.create(:cloud_volume_type) }

    context 'when tile mode is selected' do
      it 'returns volume types with quadicons' do
        volume_type
        session[:settings] = {:views => {:cloud_volume_type => 'tile'}}
        report_data_request(
          :model      => 'CloudVolumeType',
          :parent_id  => nil,
          :explorer   => false,
          :gtl_dbname => :cloud_volume_type,
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
        expect(results['data']['rows'][0]['long_id']).to eq(volume_type.id.to_s)
        expect(results['data']['rows'][0]['quad']).to have_key('fonticon')
      end
    end
  end
end
