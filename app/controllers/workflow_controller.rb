class WorkflowController < ApplicationController
  before_action :check_prototype
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::WorkflowCheckPrototypeMixin

  menu_section :embedded_workflow

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::Workflow
  end

  def show_searchbar?
    true
  end

  def button
    case params[:pressed]
    when 'embedded_configuration_script_payload_map_credentials'
      javascript_redirect(:action => 'map_credentials', :id => params[:miq_grid_checks])
    when 'embedded_configuration_script_payload_tag'
      tag(self.class.model)
    end
  end

  def map_credentials
    assert_privileges('embedded_configuration_script_payload_map_credentials')
    workflow = find_record_with_rbac(self.class.model, params[:id])
    drop_breadcrumb(:name => _("Map Credentials to \"%{name}\"") % {:name => workflow.name},
                    :url  => "/workflow/map_credentials/#{params[:id]}")
    @in_a_form = true
    @id = workflow.id
  end

  def toolbar
    %w[show_list].include?(@lastaction) ? 'workflows_center' : 'workflow_center'
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
        {:title => _("Embedded Workflows")},
        {:url   => controller_url, :title => _("Workflows")},
      ],
    }
  end
end
