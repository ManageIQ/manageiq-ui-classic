describe "ops/_settings_cu_collection_tab.html.haml" do
  let(:cluster) { FactoryBot.create(:ems_cluster) }
  let(:ems) { FactoryBot.create(:ext_management_system) }

  let(:host_1) { FactoryBot.create(:host, :ems_cluster => cluster) }
  let(:host_2) { FactoryBot.create(:host, :ems_cluster => cluster) }
  let(:host_3) { FactoryBot.create(:host, :ext_management_system => ems) }

  let(:datastore) { FactoryBot.create(:storage, :name => 'Name', :hosts => [host_1]) }

  before do
    assign(:sb, :active_tab => "settings_cu_collection")

    MiqRegion.seed
    allow(host_1).to receive(:perf_capture_enabled?).and_return(true)
    allow(host_2).to receive(:perf_capture_enabled?).and_return(false)
    allow(host_3).to receive(:perf_capture_enabled?).and_return(true)

    @host = FactoryBot.create(:host, :name => 'Host Name')
    datastores = {
      datastore.id => {
        :name     => 'Datastore',
        :location => 'Location',
        :st_rec   => datastore,
        :capture  => false,
      }
    }
    @datastore_tree = TreeBuilderDatastores.new(:datastore_tree, {}, true, :root => datastores)
    @cluster_tree = TreeBuilderClusters.new(:cluster_tree, {}, true, :root => EmsCluster.get_perf_collection_object_list)
  end

  it "Displays note if there are no Clusters" do
    @cluster_tree = nil
    assign(:edit, :new => {:all_clusters => false})
    render
    expect(response).to have_selector("div.note b", :text => "Note: No Clusters available.")
  end

  it "Displays note if there are no Datastores" do
    @datastore_tree = nil
    assign(:edit, :new => {:all_storages => false})
    render
    expect(response).to have_selector("div.note b", :text => "Note: No Datastores available.")
  end
end
