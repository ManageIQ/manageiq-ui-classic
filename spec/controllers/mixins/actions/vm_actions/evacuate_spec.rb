describe Mixins::Actions::VmActions::Evacuate do
  describe '#evacuate_vm' do
    let(:controller) { VmCloudController.new }

    before do
      allow(controller).to receive(:assert_privileges)
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@sb, :explorer => true)
      controller.params = {}
    end

    it 'sets @sb[:explorer] back to nil after canceling/submitting evacuating selected Instances' do
      controller.send(:evacuate_vm)
      expect(controller.instance_variable_get(:@sb)[:explorer]).to be_nil
    end
  end
end
