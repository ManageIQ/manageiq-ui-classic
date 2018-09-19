class ApplicationHelper::Toolbar::TemplatesCenter < ApplicationHelper::Toolbar::Basic
  button_group('template_configuration', [
    select(
      :image_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items   => [
        button(
          :image_create,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Image'),
          t,
          :enabled   => false
        ),
        button(
          :image_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single item to edit'),
          N_('Edit Selected item'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
        ),
        separator,
        button(
          :template_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Images'),
          t,
          :url_parms => "main_div",
          :send_checked => true,
          :confirm   => N_("Warning: The selected Images will be permanently removed!"),
          :enabled   => false,
          :onwhen    => "1+"
        )
      ]
    ),
  ])
  button_group('image_lifecycle', [
    select(
      :image_lifecycle_choice,
      'pficon pficon-add-circle-o fa-lg',
      t = N_('Lifecycle'),
      t,
      :items => [
        button(
          :image_miq_request_new,
          'ff ff-clone fa-lg',
          N_('Select a single Image to Provision Instances'),
          N_('Provision Instances using selected Image'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1",
          :klass        => ApplicationHelper::Button::ButtonNewDiscover),
      ]
    ),
  ])
  button_group('image_policy', [
    select(
      :image_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :image_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for the selected items'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :image_policy_sim,
          'fa fa-play-circle-o fa-lg',
          N_('View Policy Simulation for the selected items'),
          N_('Policy Simulation'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :image_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :image_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for the selected items'),
          N_('Check Compliance of Last Known Configuration'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Initiate Check Compliance of the last known configuration for the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
