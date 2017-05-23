require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ViewGHT do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree} }
  let(:instance_data) { {'ght_type' => ght_type, 'report' => report, 'zgraph' => zgraph} }
  let(:props) { Hash.new }
  let(:ght_type) { 'tabular' }
  let(:report) { FactoryGirl.create(:miq_report) }
  let(:zgraph) { nil }
  let(:graph) { nil }

  before { allow(report).to receive(:graph).and_return(graph) }

  describe '#visible?' do
    %w(reports_tree savedreports_tree).each do |tree|
      context "when x_active_tree == #{tree}" do
        let(:tree) { tree.to_sym }
        context 'when ght_type is not tabular' do
          let(:ght_type) { 'hybrid' }
          include_examples 'ApplicationHelper::Button::Basic visible'
        end
        context 'when report has graph' do
          let(:graph) { true }
          include_examples 'ApplicationHelper::Button::Basic visible'
        end
        context 'when zgraph is available' do
          let(:zgraph) { true }
          include_examples 'ApplicationHelper::Button::Basic visible'
        end
        context 'when ght_type is tabular && report does not have graph && not a zgraph' do
          include_examples 'ApplicationHelper::Button::Basic hidden'
        end
      end
    end
    context 'when !%w(reports_tree savedreports_tree).include?(x_active_tree)' do
      let(:tree) { :not_any_of_reports_trees }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
  end
end
