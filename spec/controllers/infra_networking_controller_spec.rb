describe InfraNetworkingController do
  let(:zone) { FactoryGirl.build(:zone) }
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }

  before { stub_user(:features => :all) }

  describe '#tree_select' do
    render_views

    context 'switch' do
      let(:ems) { FactoryGirl.create(:ems_vmware) }
      let(:cluster) { FactoryGirl.create(:ems_cluster, :ems_id => ems.id) }
      let(:host) { FactoryGirl.create(:host_vmware, :ems_id => ems.id, :ems_cluster => cluster) }
      let(:switch) do
        sw = FactoryGirl.create(:switch_vmware, :ems_id => ems.id)
        FactoryGirl.create(:host_switch, :host => host, :switch => sw)
        sw
      end

      it 'renders the network switch center toolbar' do
        nodeid = [ems, cluster, switch].map { |item| TreeNode.new(item).key }.join('_')
        expect(ApplicationHelper::Toolbar::XInfraNetworkingSwitchCenter).to receive(:definition).and_return([]).at_least(:once)
        post :tree_select, :params => { :id => nodeid }
      end
    end
  end
end
