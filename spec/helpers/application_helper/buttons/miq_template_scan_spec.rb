describe ApplicationHelper::Button::MiqTemplateScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:template_vmware) }
  let(:props) { {:options => {:feature => :smartstate_analysis}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  describe '#calculate_properties' do
    before do
      mock
      button.calculate_properties
    end

    context 'when record supports :smartstate_analysis' do
      let(:mock) do
        allow(record).to receive(:supports?).with(:smartstate_analysis).and_return(true)
        allow(record).to receive(:has_active_proxy?).and_return(has_active_proxy)
      end
      context 'and has active proxy' do
        let(:has_active_proxy) { true }
        it_behaves_like 'an enabled button'
      end
      context 'and does not have active proxy' do
        let(:has_active_proxy) { false }
        it_behaves_like 'a disabled button', 'No active SmartProxies found to analyze this VM'
      end
    end
  end
end
