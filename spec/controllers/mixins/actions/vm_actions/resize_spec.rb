describe Mixins::Actions::VmActions::Resize do
  describe '#resize_vm' do
    let(:controller) { VmCloudController.new }
    let(:instance) { FactoryBot.create(:vm_cloud) }

    before do
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@sb, :explorer => true)
      controller.instance_variable_set(:@breadcrumbs, [])
      controller.params = {:objectId => instance}
    end

    it 'sets @sb[:explorer] back to nil after reconfiguring selected Instances' do
      controller.send(:resize_vm)
      expect(controller.instance_variable_get(:@sb)[:explorer]).to be_nil
    end
  end
end
