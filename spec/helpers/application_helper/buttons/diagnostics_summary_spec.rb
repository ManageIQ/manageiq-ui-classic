require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DiagnosticsSummary do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree, :active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  it_behaves_like 'a button with correct active context', :diagnostics_tree, 'diagnostics_summary'
  it_behaves_like 'a button with incorrect active context', :not_diagnostics_tree, 'diagnostics_summary'
  it_behaves_like 'a button with incorrect active context', :diagnostics_tree, 'not_diagnostics_summary'
end
