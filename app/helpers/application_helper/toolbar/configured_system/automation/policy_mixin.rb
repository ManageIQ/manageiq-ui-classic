module ApplicationHelper::Toolbar::ConfiguredSystem::Automation::PolicyMixin
  def self.included(included_class)
    included_class.button_group('automation_manager_policy', [
      included_class.select(
        :automation_manager_policy_choice,
        nil,
        N_('Policy'),
        :enabled => true,
        :items   => [
          included_class.button(
            :automation_manager_configured_system_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Configured System'),
            N_('Edit Tags'),
            :url          => "tagging",
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => true
          ),
        ]
      ),
    ])
  end
end
