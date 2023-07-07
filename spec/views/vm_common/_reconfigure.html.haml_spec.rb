describe 'vm_common/_reconfigure.html.haml' do
  before do
    helper_data = {
      :recordId  => [12],
      :requestId => 'new',
      :roles     => [
        :allowMemoryChange   => true,
        :allowCpuChange      => true,
        :allowDiskChange     => true,
        :allowDiskSizeChange => true,
        :allowNetworkChange  => true,
        :allowCdromsChange   => true,
        :isVmwareInfra       => true,
        :isVmwareCloud       => false,
        :isRedhat            => false,
      ],
      :memory    => [
        :min     => 4,
        :max     => 40,
        :max_cpu => 14,
      ],
      :options   => [
        :controller_types    => [],
        :vlan_options        => [],
        :avail_adapter_names => [],
        :host_file_options   => [],
        :socket_options      => ['1', '2', '3'],
        :cores_options       => ['1', '2', '3'],
      ]
    }
    allow(view).to receive(:reconfigure_form_data) { helper_data }
    allow(view).to receive(:render_gtl_outer) { true }
  end
  context 'render vm reconfigure page', :js => true do
    let(:host_2x2) { FactoryBot.create(:host_vmware_esx, :hardware => FactoryBot.create(:hardware, :cpu2x2, :ram1GB)) }
    let(:vm) do
      FactoryBot.create(:vm_vmware,
                        :id                    => 12,
                        :ext_management_system => FactoryBot.create(:ems_infra),
                        :host                  => host_2x2,
                        :hardware              => FactoryBot.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => "07"))
    end

    it 'the reconfigure tab displays reconfigure form', :js => true do
      view.instance_variable_set(:@edit, :roles => %w[fred wilma])
      view.instance_variable_set(:@reconfigitems, [vm])

      render :partial => 'vm_common/reconfigure'
      expect(response).to include('ReconfigureVmForm')
    end
  end
end
