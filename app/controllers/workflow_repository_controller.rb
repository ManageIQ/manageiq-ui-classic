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
  include Mixins::WorkflowCheckPrototypeMixin

  menu_section :embedded_workflow_repository

  def self.display_methods
    %w[workflows]
  end

  def self.custom_display_modes
    %w[output]
  end

  def self.model
    ManageIQ::Providers::Workflows::AutomationManager::ConfigurationScriptSource
  end

  def show_searchbar?
    true
  end

  def title
    _("Repository")
  end

  def button
    case params[:pressed]
    when "embedded_configuration_script_source_edit"
      id = params[:miq_grid_checks]
      javascript_redirect(:action => 'edit', :id => id)
    when "embedded_configuration_script_source_add"
      javascript_redirect(:action => 'new')
    when "workflow_repositories_reload"
      show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl")
      end
    when "workflow_repository_reload"
      show
      render :update do |page|
        page << javascript_prologue
        page.replace("main_div", :template => "workflow_repository/show")
      end
    when "ansible_repository_tag"
      tag(self.class.model)
    when "embedded_configuration_script_payload_tag" # workflows from nested list
      tag(ManageIQ::Providers::Workflows::AutomationManager::Workflow)
    end
  end

  def edit
    assert_privileges('embedded_configuration_script_source_edit')
    @record = self.class.model.find(params[:id])
    drop_breadcrumb(:name => _("Edit a Repository \"%{name}\"") % {:name => @record.name},
                    :url  => "/workflow_repository/edit/#{@record.id}")
    @title = _("Edit Repository \"%{name}\"") % {:name => @record.name}
    @id = @record.id
    @in_a_form = true
  end

  def new
    assert_privileges('embedded_configuration_script_source_add')
    drop_breadcrumb(:name => _("Add a new Repository"), :url => "workflow_repository/new")
    @title = _("Add new Repository")
    @id = 'new'
    @in_a_form = true
  end

  def check_button_rbac
    # Allow reload to skip RBAC check
    if %w[workflow_repository_reload workflow_repositories_reload].include?(params[:pressed])
      true
    else
      super
    end
  end

  def show_list
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  def show
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  def show_output
    drop_breadcrumb(:name => _("Refresh output"), :url => show_output_link)
    @showtype = 'output'
  end

  def display_workflows
    nested_list(ManageIQ::Providers::Workflows::AutomationManager::Workflow, :breadcrumb_title => _('Workflows'))
  end

  def repository_refresh
    assert_privileges("embedded_configuration_script_source_refresh")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]

    self.class.model.where(:id => checked).each do |repo|
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
    return 'workflows_center' if %w[workflows].include?(@display) # for nested list screen

    %w[show_list].include?(@lastaction) ? 'workflow_repositories_center' : 'workflow_repository_center'
  end

  def download_data
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  def download_summary_pdf
    assert_privileges('embedded_configuration_script_source_view')
    super
  end

  private

  def textual_group_list
    [%i[properties relationships options smart_management]]
  end

  helper_method :textual_group_list

  def show_output_link
    show_link(@record, :display => :output)
  end

  helper_method :show_output_link
  
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
