require 'shared/helpers/application_helper/buttons/render_report'

describe ApplicationHelper::Button::RenderReport do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    include_context 'ApplicationHelper::Button::RenderReport#calculate_properties'
  end
end
