describe ApplicationHelper::Button::MiqActionModify do
  let(:view_context) { setup_view_context_with_sandbox(:active_tree => tree) }
  let(:record) { FactoryBot.create(:miq_policy) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }
  let(:tree) { :policy_tree }

  describe '#visible?' do
    subject { button.visible? }

    context 'when active_tree == :event_tree' do
      let(:tree) { :event_tree }
      let(:record) { FactoryBot.create(:miq_event_definition) }
      it { expect(subject).to be_falsey }
    end
    context 'when active_tree == :policy_tree' do
      let(:record) { FactoryBot.create(:miq_policy) }
      it { expect(subject).to be_truthy }
    end
  end

  describe '#disabled?' do
    subject { button.disabled? }
    context 'when policy is read_only' do
      let(:record) { FactoryBot.create(:miq_policy_read_only) }
      it { expect(subject).to be_truthy }
    end
    context 'when policy is not read-only' do
      let(:record) { FactoryBot.create(:miq_policy) }
      it { expect(subject).to be_falsey }
    end
  end

  describe '#calculate_properties' do
    let(:record) { FactoryBot.create(:miq_policy_read_only) }
    subject { button[:title] }

    before { button.calculate_properties }

    context "when event is selected" do
      let(:type) { 'ev' }
      it { expect(subject).to eq('This Event belongs to a read only Policy and cannot be modified') }
    end
  end
end
