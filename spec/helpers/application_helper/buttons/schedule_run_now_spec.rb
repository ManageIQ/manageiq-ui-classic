describe ApplicationHelper::Button::ScheduleRunNow do
  let(:view_context) { setup_view_context_with_sandbox(:active_tree => tree) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when active_tree != settings_tree' do
      let(:tree) { :not_settings_tree }
      it { expect(subject).to be_falsey }
    end
    context 'when active_tree == settings_tree' do
      let(:tree) { :settings_tree }
      it { expect(subject).to be_truthy }
    end
  end
end
