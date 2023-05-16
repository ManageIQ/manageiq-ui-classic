shared_context :shared_storage_manager_context do |t|
  before do
    @ems_cloud = FactoryBot.create("ems_#{t}".to_sym,
                                   :name => "Test Cloud Manager")
    @ems = @ems_cloud.cinder_manager if t == 'openstack'
  end
end
