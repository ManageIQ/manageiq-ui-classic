describe EmsStorageHelper::TextualSummary do
  describe "for EmsInfra" do
    before do
      instance_variable_set(:@record, FactoryBot.create(:ems_infra))
      allow(self).to receive(:textual_authentications).and_return([])
    end

    include_examples "textual_group", "Properties", %i[provider_region hostname ipaddress type port guid]

    include_examples "textual_group", "Relationships", %i[
      parent_ems_cloud
      cloud_volumes
      cloud_volume_snapshots
      cloud_volume_backups
      cloud_object_store_containers
      custom_button_events
    ]

    include_examples "textual_group", "Status", %i[refresh_status refresh_date]

    include_examples "textual_group_smart_management", %i[zone]
  end

  describe "for OpenStack Cinder Manager" do
    before do
      instance_variable_set(:@record, FactoryBot.create(:ems_cinder))
      allow(self).to receive(:textual_authentications).and_return([])
    end

    include_examples "textual_group", "Relationships", %i[
      parent_ems_cloud
      cloud_volumes
      cloud_volume_snapshots
      cloud_volume_backups
      cloud_object_store_containers
      custom_button_events
      cloud_volume_types
    ]
  end
end
