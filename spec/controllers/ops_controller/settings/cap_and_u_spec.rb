describe OpsController do
  before do
    MiqRegion.seed
  end

  context '#cu_build_edit_screen' do
    before do
      tree_hash = {
        :trees       => {
          :settings_tree => {
            :active_node => "root"
          }
        },
        :active_tree => :settings_tree,
        :active_tab  => 'settings_cu_collection'
      }
      controller.instance_variable_set(:@sb, tree_hash)
    end

    it 'should have no tree data set when there are no clusters/storage records in db' do
      controller.send(:cu_build_edit_screen)
      expect(assigns(:cluster_tree)).to eq(nil)
      expect(assigns(:datastore_tree)).to eq(nil)
    end

    it 'should have tree data set when there are clusters/storage records in db' do
      FactoryBot.create(:ems_cluster, :name => "My Cluster")
      FactoryBot.create(:storage_vmware, :name => "My Datastore")
      controller.send(:cu_build_edit_screen)
      expect(assigns(:cluster_tree)).to_not eq(nil)
      expect(assigns(:datastore_tree)).to_not eq(nil)
    end
  end

  context '#cu_collection_fetch' do
    before { stub_user(:features => :all) }

    it 'returns the flags from the database, not from a stale per-process cache' do
      # Warm the cache with "both off"
      expect(Metric::Targets.perf_capture_always).to eq(:host_and_cluster => false, :storage => false)

      # Another worker saves "both on", behind this process's cache
      MiqRegion.find(MiqRegion.my_region.id).perf_capture_always = {:host_and_cluster => true, :storage => true}

      get :cu_collection_fetch

      expect(response.parsed_body).to include("all_clusters" => true, "all_datastores" => true)
    end
  end

  context '#cu_collection_fetch per-host and per-datastore flags' do
    before { stub_user(:features => :all) }

    it 'derives host and datastore capture from the database, not from a stale per-process cache' do
      cluster = FactoryBot.create(:ems_cluster)
      host = FactoryBot.create(:host, :ems_cluster => cluster)
      storage = FactoryBot.create(:storage_vmware)

      # Warm the cache with "both off"
      expect(Metric::Targets.perf_capture_always).to eq(:host_and_cluster => false, :storage => false)

      # Another worker turns both on, so hosts and datastores become always-on
      MiqRegion.find(MiqRegion.my_region.id).perf_capture_always = {:host_and_cluster => true, :storage => true}

      get :cu_collection_fetch

      body = response.parsed_body
      expect(body["hosts"]).to include(a_hash_including("id" => host.id, "capture" => true))
      expect(body["datastores"]).to include(a_hash_including("id" => storage.id, "capture" => true))
    end
  end

  context '#cu_collection_update' do
    before do
      stub_user(:features => :all)
      controller.instance_variable_set(:@sb, :trees => {:settings_tree => {:active_node => "root"}}, :active_tree => :settings_tree, :active_tab => 'settings_cu_collection')
    end

    let(:region) { MiqRegion.my_region }

    it 'writes the region flags even when the cached current value already matches, and returns the saved state' do
      # Stale cache says both are already on; the DB says off
      allow(Metric::Targets).to receive(:perf_capture_always).and_return(:host_and_cluster => true, :storage => true)
      expect(MiqRegion.find(region.id).perf_capture_always).to eq(:host_and_cluster => false, :storage => false)

      # Submitting "on" matches the stale cache, so a compare-then-write would skip it
      post :cu_collection_update, :params => {:all_clusters => true, :all_datastores => true, :button => 'save'}, :as => :json

      body = response.parsed_body
      expect(body).to include("success" => true, "all_clusters" => true, "all_datastores" => true)
      expect(MiqRegion.find(region.id).perf_capture_always).to eq(:host_and_cluster => true, :storage => true)
    end

    it 'returns the new state when both flags are turned off' do
      region.perf_capture_always = {:host_and_cluster => true, :storage => true}
      Metric::Targets.perf_capture_always_clear_cache

      post :cu_collection_update, :params => {:all_clusters => false, :all_datastores => false, :button => 'save'}, :as => :json

      body = response.parsed_body
      expect(body).to include("success" => true, "all_clusters" => false, "all_datastores" => false)
      expect(MiqRegion.find(region.id).perf_capture_always).to eq(:host_and_cluster => false, :storage => false)
    end
  end
end
