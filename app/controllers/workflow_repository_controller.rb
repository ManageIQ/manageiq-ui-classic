class WorkflowRepositoryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :embedded_workflow_repository

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource
  end

  def show_list
    @title = _("Workflow Reporitories")
    assert_privileges('embedded_configuration_script_source_view')
    # super
  end

  def show
    assert_privileges('embedded_configuration_script_source_view')
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Embedded Workflow")},
        {:title => _("Repositories"), :url => controller_url},
      ],
    }
  end
end
