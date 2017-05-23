require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::RenderReport#calculate_properties' do
  let(:html) { false }
  let(:zgraph) { false }
  let(:records_count) { 0 }
  let(:records_total) { {:count => records_count} }
  let(:grouping) { {:_total_ => records_total} }
  let(:report) { FactoryGirl.create(:miq_report, :extras => {:grouping => grouping}) }
  let(:instance_data) { {'report' => report, 'html' => html, 'zgraph' => zgraph} }

  context 'when report info is not available' do
    include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => 'No records found for this report'
  end
  context "when report's tabular view is available" do
    let(:html) { '<table><tr><td>Some table</td></tr></table>' }
    include_examples 'ApplicationHelper::Button::RenderReport T/G View is available'
  end
  context "when report's graph view is available" do
    let(:zgraph) { true }
    include_examples 'ApplicationHelper::Button::RenderReport T/G View is available'
  end
end

shared_examples_for 'ApplicationHelper::Button::RenderReport T/G View is available' do
  context 'and report has data about records' do
    context 'and total number of records is 0' do
      include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => 'No records found for this report'
    end
    context 'and total number of records is more than 0' do
      let(:records_count) { 1 }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
  context 'and report does not have data about records' do
    let(:grouping) { nil }
    include_examples 'ApplicationHelper::Button::Basic enabled'
  end
end
