class AnsiblePlaybookController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::ListnavMixin
  include Mixins::BreadcrumbsMixin

  menu_section :ansible_playbooks

  def self.model
    ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook
  end

  def button
    if params[:pressed] == "embedded_configuration_script_payload_tag"
      tag(self.class.model)
    end
  end

  def toolbar
    %w[show_list].include?(@lastaction) ? 'ansible_playbooks_center' : 'ansible_playbook_center'
  end

  def download_data
    assert_privileges('embedded_configuration_script_payload_view')
    super
  end

  def download_summary_pdf
    assert_privileges('embedded_configuration_script_payload_view')
    super
  end

  def show
    assert_privileges('embedded_configuration_script_payload_view')
    super
  end

  def show_list
    assert_privileges('embedded_configuration_script_payload_view')
    super
  end

  def tag_edit_form_field_changed
    assert_privileges('embedded_configuration_script_payload_tag')
    super
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
