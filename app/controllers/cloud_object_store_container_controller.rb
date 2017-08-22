class CloudObjectStoreContainerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin

  def breadcrumb_name(_model)
    ui_lookup(:tables => "cloud_object_store_container")
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    case params[:pressed]
    when "cloud_object_store_container_new"
      return javascript_redirect(:action => "new")
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
    %w(cloud_object_store_objects)
  end

  def new
    assert_privileges("cloud_object_store_container_new")
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    @provider_regions = retrieve_provider_regions
    drop_breadcrumb(
      :name => _("Add New %{model}") % {:model => ui_lookup(:table => 'cloud_object_store_container')},
      :url  => "/cloud_object_store_container/new"
    )
  end

  def create
    assert_privileges("cloud_object_store_container_new")
    case params[:button]
    when "cancel"
      javascript_redirect previous_breadcrumb_url
    when "add"
      options = form_params_create
      ext_management_system = options.delete(:ems)

      # Queue task
      task_id = CloudObjectStoreContainer.cloud_object_store_container_create_queue(
        session[:userid],
        ext_management_system,
        options
      )

      if task_id.kind_of?(Integer)
        initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
      else
        add_flash(_("Cloud Object Store Container creation failed: Task start failed"), :error)
        javascript_flash(:spinner_off => true)
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    container_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Cloud Object Store Container \"%{name}\" created") % {
        :name => container_name
      })
    else
      add_flash(_("Unable to create Cloud Object Store Container \"%{name}\": %{details}") % {
        :name    => container_name,
        :details => task.message
      }, :error)
    end

    session[:flash_msgs] = @flash_array.dup if @flash_array
    javascript_redirect previous_breadcrumb_url
  end

  def form_params_create
    options = {}
    options[:name] = params[:name] if params[:name]

    # Depending on the storage manager type, collect required form params.
    case params[:emstype]
    when "ManageIQ::Providers::Amazon::StorageManager::S3"
      if params[:provider_region]
        options[:create_bucket_configuration] = {
          :location_constraint => params[:provider_region]
        }
      end

      # Get the storage manager.
      storage_manager_id = params[:storage_manager_id] if params[:storage_manager_id]
      options[:ems] = find_record_with_rbac(ExtManagementSystem, storage_manager_id)
    end
    options
  end

  private

  def retrieve_provider_regions
    managers = ManageIQ::Providers::CloudManager.supported_subclasses.select(&:supports_regions?)
    managers.each_with_object({}) do |manager, provider_regions|
      regions = manager.parent::Regions.all.sort_by { |r| r[:description] }
      provider_regions[manager.name] = regions.map { |region| [region[:description], region[:name]] }
    end
  end

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  menu_section :ost

  has_custom_buttons
end
