describe ApplicationHelper::Button::DbRefresh do
  let(:view_context) { setup_view_context_with_sandbox(:active_tab => tab) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    %w(db_details db_indexes db_settings db_connections).each do |tree|
      context "when active_tree == #{tree}" do
        let(:tab) { tree }
        it { expect(subject).to be_truthy }
      end
    end
    context 'when !active_tree.in?(%w(db_details db_indexes db_settings db_connections))' do
      let(:tab) { 'something_else' }
      it { expect(subject).to be_falsey }
    end
  end
end
