describe ApplicationHelper::Button::MiqAlertDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:owning_miq_actions).and_return(owning_miq_actions) }
    before { allow(record).to receive(:memberof).and_return(memberof) }

    context 'and record doesnt own any action and is not memberof any group' do
      let(:owning_miq_actions) { [] }
      let(:memberof) { [] }
      it_behaves_like 'an enabled button'
    end

    context 'and record is member of group' do
      let(:owning_miq_actions) { [] }
      let(:memberof) { ['group'] }
      it_behaves_like 'a disabled button',
                      'Alerts that belong to Alert Profiles can not be deleted'
    end

    context 'and record owns action' do
      let(:owning_miq_actions) { ['action'] }
      let(:memberof) { [] }
      it_behaves_like 'a disabled button',
                      'Alerts referenced by Actions can not be deleted'
    end
  end
end
