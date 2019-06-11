describe Mixins::Actions::VmActions::Rename do
  let(:vm) { FactoryBot.create(:vm_vmware) }

  describe '#rename_cancel' do
    before do
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@record, vm)
    end

    context 'explorer screen' do
      let(:controller) { VmInfraController.new }
      let(:edit) { {:explorer => true} }

      before { controller.instance_variable_set(:@sb, :action => 'rename') }

      it 'cancels renaming of VM' do
        expect(controller).to receive(:add_flash).with(_("Rename of VM \"%{name}\" was cancelled by the user") % {:name => vm.name})
        expect(controller).to receive(:replace_right_cell)
        controller.send(:rename_cancel)
        expect(controller.instance_variable_get(:@record)).to be(nil)
        expect(controller.instance_variable_get(:@sb)[:action]).to be(nil)
      end
    end

    context 'non-explorer screen' do
      let(:controller) { EmsInfraController.new }
      let(:edit) { {:explorer => nil} }
      let(:url) { '/ems_infra/1?display=vms' }

      before do
        allow(controller).to receive(:previous_breadcrumb_url).and_return(url)
        allow(controller).to receive(:render).and_return(true)
      end

      it 'cancels renaming of VM' do
        expect(controller).to receive(:flash_to_session).with(_("Rename of VM \"%{name}\" was cancelled by the user") % {:name => vm.name})
        expect(controller).to receive(:javascript_redirect).with(url)
        controller.send(:rename_cancel)
      end
    end
  end

  describe '#rename_save' do
    let(:controller) { VmInfraController.new }
    let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
    let(:zone) { FactoryBot.create(:zone) }

    before do
      allow(controller).to receive(:session).and_return(:userid => 'admin')
      controller.instance_variable_set(:@record, vm)
      controller.instance_variable_set(:@edit, :new => {:name => 'new_vm_name'})
    end

    context 'getting proper task_id' do
      it 'initiates wait for task' do
        expect(controller).to receive(:initiate_wait_for_task).with(:task_id => kind_of(Integer), :action => 'rename_finished')
        controller.send(:rename_save)
      end
    end

    context 'getting improper task_id' do
      before { allow(vm).to receive(:rename_queue).with('admin', 'new_vm_name').and_return(nil) }

      it 'adds flash message about failing task start' do
        expect(controller).to receive(:add_flash).with(:text        => _("VM rename: Task start failed"),
                                                       :severity    => :error,
                                                       :spinner_off => true)
        controller.send(:rename_save)
      end
    end
  end

  describe '#rename_reset' do
    before { controller.instance_variable_set(:@edit, edit) }

    context 'explorer screen' do
      let(:controller) { VmInfraController.new }
      let(:edit) { {:explorer => true} }

      before { allow(controller).to receive(:session).and_return(:changed => true) }

      it 'resets VM Rename changes' do
        expect(controller).to receive(:vm_rename)
        expect(controller).to receive(:add_flash).with(_('All changes have been reset'), :warning)
        expect(controller).to receive(:replace_right_cell)
        controller.send(:rename_reset)
        expect(controller.instance_variable_get(:@changed)).to be(false)
        expect(controller.session).to eq(:changed => false)
      end
    end

    context 'non-explorer screen' do
      let(:controller) { EmsInfraController.new }
      let(:edit) { {:explorer => nil} }

      before do
        allow(controller).to receive(:render).and_return(true)
        controller.params = {:id => vm.id.to_s}
      end

      it 'resets VM Rename changes' do
        expect(controller).to receive(:vm_rename)
        expect(controller).to receive(:add_flash).with(_('All changes have been reset'), :warning)
        expect(controller).to receive(:flash_to_session)
        expect(controller).to receive(:javascript_redirect).with(:action => 'rename_vm', :controller => 'vm', :id => vm.id.to_s)
        controller.send(:rename_reset)
      end
    end
  end
end
