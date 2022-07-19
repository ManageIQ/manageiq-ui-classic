describe ApplicationHelper::Button::MiqActionDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:miq_policies).and_return(miq_policies) }
    before { allow(record).to receive(:action_type).and_return(action_type) }

    context 'and record has no policies' do
      let(:miq_policies) { [] }
      let(:action_type) { "Non-default" }
      it_behaves_like 'an enabled button'
    end

    context 'and record has assigned policy' do
      let(:miq_policies) { ['policy'] }
      let(:action_type) { "Non-default" }
      it_behaves_like 'a disabled button',
                      'Actions assigned to Policies can not be deleted'
    end

    context 'and record has default action type' do
      let(:miq_policies) { [] }
      let(:action_type) { "default" }
      it_behaves_like 'a disabled button',
                      'Default actions can not be deleted.'
    end
  end
end
