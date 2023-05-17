class WorkflowController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :embedded_workflow

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::Workflow
  end

  def show_list
    assert_privileges('embedded_configuration_script_payload_view')
    super
    @title = _("Workflows")
  end

  def show
    assert_privileges('embedded_configuration_script_payload_view')
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Embedded Workflow")},
        {:url   => controller_url, :title => _("Workflows")},
      ],
    }
  end
end
