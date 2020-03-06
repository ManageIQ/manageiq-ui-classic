describe Mixins::GenericFormMixin do
  describe '#flash_and_redirect' do
    let(:controller) { HostAggregateController.new }

    before do
      allow(controller).to receive(:session).and_return(:edit => {:expression => {}})
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'previous_url'}, {:url => 'last_url'}])
    end

    it 'calls flash_to_session, javascript_redirect and sets session[:edit] to nil' do
      expect(controller).to receive(:flash_to_session).with('Message', :error)
      expect(controller).to receive(:javascript_redirect).with('previous_url')
      controller.send(:flash_and_redirect, 'Message', :error)
      expect(controller.session[:edit]).to be_nil
    end
  end
end
