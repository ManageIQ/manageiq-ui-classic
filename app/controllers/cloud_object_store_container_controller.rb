class CloudObjectStoreContainerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin
  include Mixins::BreadcrumbsMixin

  def breadcrumb_name(_model)
    _('Cloud Object Store Containers')
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    case params[:pressed]
    when "cloud_object_store_container_new"
      return javascript_redirect(:action => "new")
    when 'cloud_object_store_container_delete'
      delete_cloud_object_store_containers
    when "custom_button"
      custom_buttons
      return
    else
      process_cloud_object_storage_buttons(params[:pressed])
    end

    if params[:pressed].ends_with?("delete")
      delete_action
    else
      render_flash unless @flash_array.nil? || performed?
    end
  end

  def self.display_methods
    %w[cloud_object_store_objects custom_button_events]
  end

  def new
    assert_privileges("cloud_object_store_container_new")
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    @provider_regions = retrieve_provider_regions
    drop_breadcrumb(
      :name => _("Add New Cloud Object Store Container"),
      :url  => "/cloud_object_store_container/new"
    )
  end

  def download_data
    # TODO: rename to match others: cloud_object_store_container_view, write migration to update existing
    assert_privileges('cloudobject_store_container_view')
    super
  end

  def download_summary_pdf
    # TODO: rename to match others: cloud_object_store_container_view, write migration to update existing
    assert_privileges('cloudobject_store_container_view')
    super
  end

  private

  def record_class
    params[:pressed].starts_with?('cloud_object_store_object') ? CloudObjectStoreObject : CloudObjectStoreContainer
  end

  def retrieve_provider_regions
    managers = ManageIQ::Providers::CloudManager.permitted_subclasses.select { |subclass| subclass.supports?(:regions) }
    managers.each_with_object({}) do |manager, provider_regions|
      regions = manager.module_parent::Regions.all.sort_by { |r| r[:description] }
      provider_regions[manager.name] = regions.map { |region| [region[:description], region[:name]] }
    end
  end

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Storage")},
        {:title => _("Object Store Containers"), :url => controller_url},
      ],
      :record_info  => @record,
      :record_title => :key,
    }.compact
  end

  def delete_cloud_object_store_containers
    assert_privileges("cloud_tenant_delete")
    containers = find_records_with_rbac(CloudObjectStoreContainer, checked_or_params)

    unless containers.empty?
      process_cloud_object_store_container(containers, "destroy")
    end
  end

  def process_cloud_object_store_container(containers, operation)
    return if containers.empty?

    if operation == "destroy"
      containers.each do |container|
        audit = {
          :event        => "cloud_object_store_container_record_delete_initiated",
          :message      => "[#{container.key}] Record delete initiated",
          :target_id    => container.id,
          :target_class => "CloudObjectStoreContainer",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        container.cloud_object_store_container_delete_queue(session[:userid])
      end
      add_flash(n_("Delete initiated for %{number} Cloud Object Store Container.",
                   "Delete initiated for %{number} Cloud Object Store Containers.",
                   containers.length) % {:number => containers.length})
    end
  end

  menu_section :ost

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  has_custom_buttons
end
