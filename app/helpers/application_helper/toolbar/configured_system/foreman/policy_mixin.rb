module ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::PolicyMixin
  def self.included(included_class)
    included_class.button_group('configuration_manager_policy', [
      included_class.select(
        :configuration_manager_policy_choice,
        nil,
        N_('Policy'),
        :items => [
          included_class.button(
            :configured_system_tag,
            'pficon pficon-edit fa-lg',
            N_('Edit Tags for this Configured System'),
            N_('Edit Tags'),
            :url          => "tagging",
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => false,
            :onwhen       => "1+"),
        ]
      ),
    ])
  end
end
