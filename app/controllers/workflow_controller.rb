class WorkflowController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.model
    ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook
    #ManageIQ::Providers::Workflows::AutomationManager::Workflow
  end

  def show_list
    assert_privileges('embedded_workflow_view')
    super
  end

  def show
    assert_privileges('embedded_workflow_view')
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Embedded Workflow")},
        {:title => _("Workflows"), :url => controller_url},
      ],
    }
  end

  menu_section :embedded_workflow
end
