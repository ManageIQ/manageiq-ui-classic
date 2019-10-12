module ApplicationHelper::Toolbar::ConfiguredSystem::Foreman::LifecycleMixin
  def self.included(included_class)
    included_class.button_group('provider_foreman_lifecycle', [
      included_class.select(
        :provider_foreman_lifecycle_choice,
        nil,
        N_('Lifecycle'),
        :enabled => true,
        :items   => [
          included_class.button(
            :configured_system_provision,
            'pficon pficon-add-circle-o fa-lg',
            N_('Provision Configured Systems'),
            :url          => "provision",
            :url_parms    => "main_div",
            :send_checked => true,
            :enabled      => false,
            :onwhen       => "1+",
            :klass        => ApplicationHelper::Button::ConfiguredSystemProvision),
        ]
      ),
    ])
  end
end
