require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::InstanceCheckCompare do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record, 'display' => display} }
  let(:props) { Hash.new }
  let(:display) { nil }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#visible?' do
    context 'when record is not kind of OrchestrationStack && display != instances' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when record is kind of OrchestrationStack && display != instances' do
      let(:record) { FactoryGirl.create(:orchestration_stack) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when record is an OrchestrationStack && display == instances' do
      let(:record) { FactoryGirl.create(:orchestration_stack) }
      let(:display) { 'instances' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
  end

  describe '#disabled?' do
    before { allow(record).to receive(:has_compliance_policies?).and_return(has_policies) }

    context 'when record has compliance policies' do
      let(:has_policies) { true }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when record does not have compliance policies' do
      let(:has_policies) { false }
      it { expect(subject.disabled?).to be_truthy }
    end
  end
end
