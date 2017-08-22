describe PlanningController do
  describe "#option_changed" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      stub_user(:features => :all)

      @host1 = FactoryGirl.create(:host, :name => 'Host1')
      @host2 = FactoryGirl.create(:host, :name => 'Host2')

      @vm1 = FactoryGirl.create(:vm_vmware, :name => 'Name1', :host => @host1)
      @vm2 = FactoryGirl.create(:vm_vmware, :name => 'Name2', :host => @host2)
      @vm3 = FactoryGirl.create(:vm_vmware, :name => 'Name3', :host => @host1)
      @vm4 = FactoryGirl.create(:vm_vmware, :name => 'Name4', :host => @host1)
    end

    it 'displays all Vms' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :planning => {:vms => {}, :options => {}})
      controller.instance_variable_set(:@_params, :filter_typ => "all")
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:planning][:vms]).to eq(@vm1.id.to_s => @vm1.name,
                                        @vm2.id.to_s => @vm2.name,
                                        @vm3.id.to_s => @vm3.name,
                                        @vm4.id.to_s => @vm4.name)
    end

    it 'displays Vms with the same name' do
      ems = FactoryGirl.create(:ems_vmware, :name => "ProviderName")
      vm5 = FactoryGirl.create(:vm_vmware,  :name => 'Name1', :host => @host2, :ext_management_system => ems)
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :planning => {:vms => {}, :options => {}})
      controller.instance_variable_set(:@_params, :filter_typ => "all")
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:planning][:vms]).to eq(@vm1.id.to_s => @vm1.name,
                                        vm5.id.to_s  => "#{ems.name}:#{vm5.name}",
                                        @vm2.id.to_s => @vm2.name,
                                        @vm3.id.to_s => @vm3.name,
                                        @vm4.id.to_s => @vm4.name)
    end

    it 'displays Vms filtered by host' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :planning => {:vms => {}, :options => {}})
      controller.instance_variable_set(:@_params, :filter_typ => "host", :filter_value => @host1.id)
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:planning][:vms]).to eq(@vm1.id.to_s => @vm1.name, @vm3.id.to_s => @vm3.name, @vm4.id.to_s => @vm4.name)
    end
  end
end
