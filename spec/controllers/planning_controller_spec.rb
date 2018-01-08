describe PlanningController do
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    stub_user(:features => :all)
  end

  describe "#option_changed" do
    before do
      @host1 = FactoryGirl.create(:host, :name => 'Host1')
      @host2 = FactoryGirl.create(:host, :name => 'Host2')

      @vm1 = FactoryGirl.create(:vm_vmware, :name => 'Name1', :host => @host1)
      @vm2 = FactoryGirl.create(:vm_vmware, :name => 'Name2', :host => @host2)
      @vm3 = FactoryGirl.create(:vm_vmware, :name => 'Name3', :host => @host1)
      @vm4 = FactoryGirl.create(:vm_vmware, :name => 'Name4', :host => @host1)
    end

    it 'displays all Vms and no flash message is set' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {})
      controller.instance_variable_set(:@_params, :filter_typ => "all")
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:vms]).to eq(@vm1.id.to_s => @vm1.name,
                             @vm2.id.to_s => @vm2.name,
                             @vm3.id.to_s => @vm3.name,
                             @vm4.id.to_s => @vm4.name)
      expect(assigns(:flash_array)).to be_nil
    end

    it 'displays Vms with the same name' do
      ems = FactoryGirl.create(:ems_vmware, :name => "ProviderName")
      vm5 = FactoryGirl.create(:vm_vmware,  :name => 'Name1', :host => @host2, :ext_management_system => ems)
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {})
      controller.instance_variable_set(:@_params, :filter_typ => "all")
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:vms]).to eq(@vm1.id.to_s => @vm1.name,
                             vm5.id.to_s  => "#{ems.name}:#{vm5.name}",
                             @vm2.id.to_s => @vm2.name,
                             @vm3.id.to_s => @vm3.name,
                             @vm4.id.to_s => @vm4.name)
    end

    it 'displays Vms filtered by host' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {})
      controller.instance_variable_set(:@_params, :filter_typ => "host", :filter_value => @host1.id)
      controller.send(:option_changed)
      sb = controller.instance_variable_get(:@sb)
      expect(sb[:vms]).to eq(@vm1.id.to_s => @vm1.name, @vm3.id.to_s => @vm3.name, @vm4.id.to_s => @vm4.name)
    end

    it 'successfully resets data' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {})
      controller.send(:reset)
      sb = controller.instance_variable_get(:@sb)
      sb_result = {
        :options    => {
          :time_profile      => nil,
          :time_profile_tz   => nil,
          :time_profile_days => nil,
          :tz                => nil
        },
        :emss       => {},
        :clusters   => {},
        :hosts      => {
          @host1.id.to_s => "Host1",
          @host2.id.to_s => "Host2"
        },
        :datastores => {},
        :vm_filters => {}
      }
      expect(sb).to eq(sb_result)
    end
  end

  describe "#plan" do
    it 'displays flash message when submit button is pressed with selecting vm options' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {:vm_mode => :allocated})
      controller.instance_variable_set(:@_params, :button => "submit")
      controller.send(:plan)
      expect(assigns(:flash_array).first[:message]).to include("At least one VM Option must be selected")
    end

    it 'no flash message is set when atleast one vm options is set' do
      allow(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :vms => {}, :options => {:vm_mode => :allocated, :trend_vcpus => "1"})
      controller.instance_variable_set(:@_params, :button => "submit")
      allow(controller).to receive(:perf_planning_gen_data)
      controller.send(:plan)
      expect(assigns(:flash_array)).to be_nil
    end
  end
end
