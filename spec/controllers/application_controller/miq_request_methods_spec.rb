describe MiqRequestController do
  describe "#dialog_partial_for_workflow" do
    before do
      @wf = FactoryBot.create(:miq_provision_virt_workflow)
    end

    it "calculates partial using wf from @edit hash" do
      controller.instance_variable_set(:@edit, :wf => @wf)
      partial = controller.send(:dialog_partial_for_workflow)
      expect(partial).to eq('shared/views/prov_dialog')
    end

    it "calculates partial using wf from @options hash" do
      controller.instance_variable_set(:@options, :wf => @wf)
      partial = controller.send(:dialog_partial_for_workflow)
      expect(partial).to eq('shared/views/prov_dialog')
    end

    it "calculates partial using wf from @options hash when user is on approve/deny form screen" do
      controller.instance_variable_set(:@edit, :stamp_typ => 'a')
      controller.instance_variable_set(:@options, :wf => @wf)
      partial = controller.send(:dialog_partial_for_workflow)
      expect(partial).to eq('shared/views/prov_dialog')
    end

    it "calculates partial using wf from @edit hash when both @edit & @options are present" do
      controller.instance_variable_set(:@edit, :wf => FactoryBot.create(:miq_provision_configured_system_foreman_workflow))
      controller.instance_variable_set(:@options, :wf => @wf)
      partial = controller.send(:dialog_partial_for_workflow)
      expect(partial).to eq('prov_configured_system_foreman_dialog')
    end

    it "clears the request datacenter name field when the source VM is changed" do
      datacenter = FactoryBot.create(:datacenter, :name => 'dcname')
      ems_folder = FactoryBot.create(:ems_folder)
      ems = FactoryBot.create(:ems_vmware)
      template = FactoryBot.create(:template_vmware)
      vm2 = FactoryBot.create(:vm_vmware)
      datacenter.ext_management_system = ems
      ems_folder.ext_management_system = ems
      @wf.instance_variable_set(:@dialogs, :dialogs => {:environment => {:fields => {:placement_dc_name => {:values => {datacenter.id.to_s => datacenter.name}}}}})
      controller.instance_variable_set(:@edit, :wf => @wf, :new => {:src_vm_id => template.id.to_s})
      controller.instance_variable_set(:@last_vm_id, vm2.id)
      controller.params = {'service__src_vm_id' => template.id, :id => "new", :controller => "miq_request"}
      @wf.instance_variable_set(:@values, :placement_dc_name=>[datacenter.id.to_s, datacenter.name])
      edit = {:wf => @wf, :new => {:placement_dc_name => [datacenter.id, datacenter.name]}}
      @wf.instance_variable_set(:@edit, edit)
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:render).and_return(true)
      allow(@wf).to receive(:get_field).and_return(:values => {:placement_dc_name=>[datacenter.id.to_s, datacenter.name]})
      controller.send(:prov_field_changed)
      values = @wf.instance_variable_get(:@values)
      expect(values.to_s).to_not include('dcname')
    end
  end

  describe '#prov_edit' do
    it 'redirects to the last link in breadcrumbs' do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      session[:edit] = {}
      controller.instance_variable_set(:@breadcrumbs, [{:url => "/ems_infra/show_list?page=1&refresh=y"},
                                                       {:url => "/ems_infra/1000000000001?display=vms"},
                                                       {}])
      controller.params = {:id => "new", :button => "cancel"}
      allow(controller).to receive(:role_allows?).and_return(true)
      page = double('page')
      allow(page).to receive(:<<).with(any_args)
      expect(page).to receive(:redirect_to).with("/ems_infra/1000000000001?display=vms")
      expect(controller).to receive(:render).with(:update).and_yield(page)
      controller.send(:prov_edit)
    end
  end

  describe '#get_template_kls' do
    before do
      controller.params = {:controller => ctrl, :template_klass => kls}
      allow(request).to receive(:parameters).and_return(:template_klass => kls, :controller => ctrl)
    end

    subject { controller.send(:get_template_kls) }

    context 'provisioning VMs displayed through details page of infra provider, Cluster, Host, Resource Poll or Storage' do
      let(:ctrl) { 'miq_request' }
      let(:kls) { 'infra' }

      it 'returns proper template klass' do
        expect(subject).to eq(ManageIQ::Providers::InfraManager::Template)
      end
    end

    context 'provisioning VMs displayed on VMs explorer screen' do
      let(:ctrl) { 'vm_infra' }
      let(:kls) { nil }

      it 'returns proper template klass' do
        expect(subject).to eq(ManageIQ::Providers::InfraManager::Template)
      end
    end

    context 'provisioning instances displayed through details page of cloud provider' do
      let(:ctrl) { 'miq_request' }
      let(:kls) { 'cloud' }

      it 'returns proper template klass' do
        expect(subject).to eq(ManageIQ::Providers::CloudManager::Template)
      end
    end

    context 'provisioning instances displayed on instances explorer screen' do
      let(:ctrl) { 'vm_cloud' }
      let(:kls) { nil }

      it 'returns proper template klass' do
        expect(subject).to eq(ManageIQ::Providers::CloudManager::Template)
      end
    end
  end
end
