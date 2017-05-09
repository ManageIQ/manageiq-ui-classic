require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqReportAction do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when active_tab is saved_reports' do
      let(:tab) { 'saved_reports' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when active_tab is not saved_reports' do
      let(:tab) { 'does_not_matter' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
