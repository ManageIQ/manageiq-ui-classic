describe ApplicationHelper::Button::DashboardDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:dashboard) { FactoryBot.create(:miq_widget_set, :read_only => read_only) }
  let(:button) { described_class.new(view_context, {}, {:dashboard => dashboard}, {}) }

  describe '#disabled?' do
    context 'when dashboard is read-only' do
      let(:read_only) { true }
      it_behaves_like 'a disabled button', 'Default Dashboard cannot be deleted'
    end

    context 'when dashboard is writable' do
      let(:read_only) { false }
      it_behaves_like 'an enabled button'
    end
  end

  describe '#skipped?' do
    context 'when dashboard is nil' do
      let(:dashboard) { nil }
      subject { button }

      it "button is hidden" do
        expect(subject.skipped?).to be_truthy
      end
    end
  end
end
