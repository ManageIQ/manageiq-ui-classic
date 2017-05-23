require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ZoneLogDepotEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree, :active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    include_examples 'ApplicationHelper::Button::Basic with correct active context',
                     :tree => :diagnostics_tree, :tab => 'diagnostics_collect_logs'
    include_examples 'ApplicationHelper::Button::Basic with incorrect active context',
                     :tree => :diagnostics_tree, :tab => 'diagnostics_servers_roles'
    include_examples 'ApplicationHelper::Button::Basic with incorrect active context',
                     :tree => :diagnostics_tree, :tab => 'diagnostics_roles_servers'
    include_examples 'ApplicationHelper::Button::Basic with incorrect active context',
                     :tree => :not_diagnostics_tree, :tab => 'anything_else'
    include_examples 'ApplicationHelper::Button::Basic with incorrect active context',
                     :tree => :diagnostics_tree, :tab => 'anything_else'
  end
end
