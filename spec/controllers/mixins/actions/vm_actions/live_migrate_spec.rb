describe Mixins::Actions::VmActions::LiveMigrate do
  describe '#live_migrate_vm' do
    let(:controller) { VmCloudController.new }

    before do
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@sb, :explorer => true)
      controller.params = {}
    end

    it 'sets @sb[:explorer] to nil after migration of selected Instances' do
      controller.send(:live_migrate_vm)
      expect(controller.instance_variable_get(:@sb)[:explorer]).to be_nil
    end
  end
end
