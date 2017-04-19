require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RestartWorkers do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:selected_worker_id => worker_id} }
  let(:instance_data) { {'sb' => sandbox} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }
    context 'when worker is not selected' do
      let(:worker_id) { nil }
      it_behaves_like 'a disabled button', 'Select a worker to restart'
    end
    context 'when worker is selected' do
      let(:worker_id) { 'not_nil' }
      it_behaves_like 'an enabled button'
    end
  end
end
