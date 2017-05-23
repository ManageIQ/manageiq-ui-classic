require 'shared/helpers/application_helper/buttons/scan'

describe ApplicationHelper::Button::SmartStateScan do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before do
      MiqServer.seed
      setup_server
      subject.calculate_properties
    end

    include_context 'ApplicationHelper::Button::Scan#calculate_properties'
  end
end
