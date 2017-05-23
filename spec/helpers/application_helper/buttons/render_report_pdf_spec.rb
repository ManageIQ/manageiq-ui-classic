require 'shared/helpers/application_helper/buttons/render_report'
require 'shared/helpers/application_helper/buttons/pdf'

describe ApplicationHelper::Button::RenderReportPdf do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::Pdf#visible?'
  end

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    include_context 'ApplicationHelper::Button::RenderReport#calculate_properties'
  end
end
