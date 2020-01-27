describe ApplicationHelper::Button::MiqCapacity do
  let(:view_context) { setup_view_context_with_sandbox(:active_tab => tab) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when active_tab == report and @sb[:summary] is present' do
      let(:tab) { 'report' }
      it do
        button.instance_variable_set(:@sb, :active_tab => "report", :summary => "data")
        is_expected.to be(true)
      end
    end
    context 'when active_tab == report and @sb[:summary] is empty' do
      let(:tab) { 'report' }
      it do
        button.instance_variable_set(:@sb, :active_tab => "report", :summary => nil)
        is_expected.to be(false)
      end
    end
    context 'when active_tab != report' do
      let(:tab) { 'not_report' }
      it { is_expected.to be(false) }
    end
  end
end
