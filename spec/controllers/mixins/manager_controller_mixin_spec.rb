describe Mixins::ManagerControllerMixin do
  describe '#replace_right_cell' do
    let(:controller) { ProviderForemanController.new }

    before do
      allow(controller).to receive(:leaf_record)
      allow(controller).to receive(:rebuild_toolbars)
      allow(controller).to receive(:render)
      allow(controller).to receive(:tag_action).and_return(false)
      controller.instance_variable_set(:@sb, {})
    end

    it 'calls replace_search_box only once' do
      expect(controller).to receive(:replace_search_box).once
      controller.send(:replace_right_cell)
    end
  end
end
