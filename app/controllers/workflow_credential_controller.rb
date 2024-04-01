class WorkflowCredentialController < ApplicationController
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

  menu_section :embedded_workflow_credentials

  def self.display_methods
    %w[repositories]
  end

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::Credential
  end

  def display_repositories
    nested_list(ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource)
  end

  def show_searchbar?
    true
  end

  def button
    case params[:pressed]
    when 'workflow_repositories_reload'
      javascript_redirect(:action => 'show', :id => params[:id], :display => 'repositories')
    when 'embedded_configuration_script_source_refresh' # refresh repositories from nested list
      repository_refresh
    when 'embedded_automation_manager_credentials_add' # add credential
      javascript_redirect(:action => 'new')
    when 'embedded_configuration_script_source_add' # add repository from nested list
      javascript_redirect(:controller => 'workflow_repository', :action => 'new')
    when 'embedded_automation_manager_credentials_edit' # edit credential
      javascript_redirect(:action => 'edit', :id => params[:miq_grid_checks])
    when 'embedded_configuration_script_source_edit' # edit repository from nested list
      javascript_redirect(:controller => 'workflow_repository', :action => 'edit', :id => params[:miq_grid_checks])
    when 'embedded_automation_manager_credential_tag' # tag credentials
      tag(self.class.model)
    when "embedded_configuration_script_source_tag" # tag repositories from nested list
      tag(ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource)
    end
  end

  def check_button_rbac
    # Allow reload to skip RBAC check
    %w[workflow_repositories_reload].include?(params[:pressed]) || super
  end

  def new
    assert_privileges('embedded_automation_manager_credentials_add')
    drop_breadcrumb(:name => _("Add a new Credential"), :url => "/workflow_credential/new")
    @in_a_form = true
    @id = 'new'
  end

  def edit
    assert_privileges('embedded_automation_manager_credentials_edit')
    auth = self.class.model.find(params[:id])
    drop_breadcrumb(:name => _("Edit a Credential \"%{name}\"") % {:name => auth.name},
                    :url  => "/workflow_credential/edit/#{params[:id]}")
    @in_a_form = true
    @id = auth.id
  end

  def repository_refresh
    assert_privileges("embedded_configuration_script_source_refresh")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]

    WorkflowRepositoryController.model.where(:id => checked).each do |repo|
      repo.sync_queue
      add_flash(_("Refresh of Repository \"%{name}\" was successfully initiated.") % {:name => repo.name})
    rescue StandardError => ex
      add_flash(_("Unable to refresh Repository \"%{name}\": %{details}") % {:name    => repo.name,
                                                                             :details => ex},
                :error)
    end

    javascript_flash
  end

  def toolbar
    return 'workflow_repositories_center' if %w[repositories].include?(@display) # for nested list screen

    %w[show_list].include?(@lastaction) ? 'workflow_credentials_center' : 'workflow_credential_center'
  end

  def download_data
    assert_privileges('embedded_automation_manager_credentials_view')

    super
  end

  def download_summary_pdf
    assert_privileges('embedded_automation_manager_credentials_view')

    super
  end

  def show
    assert_privileges('embedded_automation_manager_credentials_view')

    super
  end

  def show_list
    assert_privileges('embedded_automation_manager_credentials_view')

    super
  end

  def tag_edit_form_field_changed
    assert_privileges('embedded_automation_manager_credential_tag')

    $log.warn(caller.pretty_inspect)

    super
  end

  private

  def textual_group_list
    [%i[properties relationships options smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Embedded Workflows")},
        {:title => _("Credentials"), :url => controller_url},
      ],
    }
  end
end
