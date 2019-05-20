describe CloudVolumeBackupController do
  describe "#tags_edit" do
    let(:classification) { Classification.find_by_name("department") }
    let(:tag1) { FactoryBot.create(:classification_tag, :name   => "tag1", :parent => classification) }
    let(:tag2) { FactoryBot.create(:classification_tag, :name   => "tag2", :parent => classification) }
    let(:backup) { FactoryBot.create(:cloud_volume_backup, :name => "cloud-volume-backup-01") }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      stub_user(:features => :all)
      session[:tag_db] = "CloudVolumeBackup"
      session[:edit] = {
        :key        => "CloudVolumeBackup_edit_tags__#{backup.id}",
        :tagging    => "CloudVolumeBackup",
        :object_ids => [backup.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => {:pressed => "cloud_volume_backup_tag", :format => :js, :id => backup.id}

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_volume_backup/show/#{backup.id}"}, 'placeholder']

      post :tagging_edit, :params => {:button => "cancel", :format => :js, :id => backup.id}

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_volume_backup/show/#{backup.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "save", :format => :js, :id => backup.id, :data => get_tags_json([tag1, tag2])}
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end
end
