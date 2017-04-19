require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::OrchestrationStackRetireNow do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:orchestration_stack, :retired => retired) }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when Orchestration Stack is retired' do
      let(:retired) { true }
      it_behaves_like 'a disabled button', 'Orchestration Stack is already retired'
    end
    context 'when OrchestrationStack is not retired' do
      let(:retired) { false }
      it_behaves_like 'an enabled button'
    end
  end
end
