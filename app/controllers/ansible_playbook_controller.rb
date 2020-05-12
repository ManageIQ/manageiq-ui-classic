class AnsiblePlaybookController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :ansible_playbooks

  def self.model
    ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook
  end

  def show_searchbar?
    true
  end

  def button
    if params[:pressed] == "embedded_configuration_script_payload_tag"
      tag(self.class.model)
    end
  end

  def toolbar
    %w[show_list].include?(@lastaction) ? 'ansible_playbooks_center' : 'ansible_playbook_center'
  end

  private

  def textual_group_list
    [%i[properties relationships smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible")},
        {:url   => controller_url, :title => _("Playbooks (Embedded Ansible)")},
      ],
    }
  end
end
