class WorkflowRepositoryController < ApplicationController
  before_action :check_prototype

  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :embedded_workflow_repository

  def self.display_methods
    %w[workflows]
  end

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource
  end

  def show_list
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  def show
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  private

  def check_prototype
    return if Settings.prototype.ems_workflows.enabled

    log_privileges(false, "Workflows are not enabled. The user is not authorized for this task or item.")
    raise MiqException::RbacPrivilegeException, _('The user is not authorized for this task or item.')
  end

  def textual_group_list
    [%i[properties relationships options smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Embedded Workflows")},
        {:title => _("Repositories"), :url => controller_url},
      ],
    }
  end
end
