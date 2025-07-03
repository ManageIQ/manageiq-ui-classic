class ContainerProjectController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericFormMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def button
    case params[:pressed]
    when "container_project_new"
      javascript_redirect(:action => "new")
    when 'container_project_delete'
      delete_container_projects
    end
  end

  def new
    assert_privileges("container_project_new")
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Add New Container Project"),
      :url  => "/container_project/new"
    )
  end

  def delete_container_projects
    assert_privileges("container_project_delete")
    container_projects = find_records_with_rbac(ContainerProject, checked_or_params)
    container_projects_to_delete = []

    container_projects.each do |container_project|
      # Check if container project has any running pods or services
      if container_project.container_groups.present? || container_project.container_services.present?
        add_flash(_("Container Project \"%{name}\" cannot be removed because it contains running workloads") %
          {:name => container_project.name}, :warning)
      else
        container_projects_to_delete.push(container_project)
      end
    end

    process_container_projects(container_projects_to_delete, "destroy") unless container_projects_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list" # list of Container Projects
      show_list
      render_flash
      @refresh_partial = "layouts/gtl"
    elsif %w[show show_dashboard].include?(@lastaction)
      if flash_errors? # either show the errors and stay on the 'show'
        render_flash
      else             # or (if we deleted what we were showing) we redirect to the listing
        flash_to_session
        javascript_redirect(previous_breadcrumb_url)
      end
    else # nested list of Container Projects
      flash_to_session
      redirect_to(last_screen_url)
    end
  end

  def show_list
    @showtype = "main"
    process_show_list(:named_scope => :active)
  end

  def download_data
    assert_privileges('container_project_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('container_project_show')
    super
  end

  private

  def textual_group_list
    [%i[properties quota limits container_labels], %i[relationships smart_management]]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:ems_id] = params[:ems_id] if params[:ems_id]
    options
  end

  def process_container_projects(container_projects, task)
    return if container_projects.empty?

    if task == "destroy"
      container_projects.each do |container_project|
        audit = {
          :event        => "container_project_record_delete_initiated",
          :message      => "[#{container_project.name}] Record delete initiated",
          :target_id    => container_project.id,
          :target_class => "ContainerProject",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        container_project.delete_container_project_queue(session[:userid])
      end
      add_flash(n_("Delete initiated for %{number} Container Project.",
                   "Delete initiated for %{number} Container Projects.",
                   container_projects.length) % {:number => container_projects.length})
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Projects"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  has_custom_buttons
end
