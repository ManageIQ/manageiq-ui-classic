class ApplicationHelper::Toolbar::PhysicalRackCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_physical_rack_vmdb',
               [
                 select(
                   :physical_rack_vmdb_choice,
                   'fa fa-cog fa-lg',
                   t = N_('Configuration'),
                   t,
                   :items => [
                     api_button(
                       :physical_rack_refresh,
                       'fa fa-refresh fa-lg',
                       N_('Refresh relationships and power states for all items related to this Infrastructure Provider'),
                       N_('Refresh Relationships and Power States'),
                       :api     => {
                         :action => 'refresh',
                         :entity => 'physical_racks',
                       },
                       :confirm => N_("Refresh relationships and power states for all items related to this Physical Rack?"),
                       :options => {:feature => :refresh}
                     ),
                   ]
                 ),
               ])
end
