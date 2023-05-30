class CloudVolumeController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericButtonMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::EmsCommon::Refresh

  def self.display_methods
    %w[cloud_volume_snapshots cloud_volume_backups instances custom_button_events host_initiators]
  end

  BUTTON_TO_ACTION_MAPPING = {
    'cloud_volume_attach'          => [:attach,   'attach'],
    'cloud_volume_clone'           => [:clone,    'clone'],
    'cloud_volume_detach'          => [:detach,   'detach'],
    'cloud_volume_edit'            => [:update,           'edit'],
    'cloud_volume_new'             => [nil,              'new'],
    'cloud_volume_snapshot_create' => [:snapshot_create, 'snapshot_new'],
    'cloud_volume_backup_create'   => [:backup_create,   'backup_new'],
    'cloud_volume_backup_restore'  => [:backup_restore,  'backup_select'],
    'cloud_volume_refresh'         => [nil, 'cloud_volume_refresh'],
  }.freeze

  def specific_buttons(pressed)
    return false unless BUTTON_TO_ACTION_MAPPING.include?(pressed)

    if pressed == "cloud_volume_refresh"
      queue_refresh(controller_to_model)
    else
      validate_action, ui_action = BUTTON_TO_ACTION_MAPPING[pressed]
      if validate_action
        validate_results = validate_item_supports_action_button(validate_action, CloudVolume)
        if validate_results[:action_supported]
          javascript_redirect(:action => ui_action, :id => checked_item_id)
        else
          render_flash(validate_results[:message], :error)
        end
      else
        javascript_redirect(:action => ui_action, :id => checked_item_id)
      end
    end
    true
  end

  def attach
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("cloud_volume_attach")
    @vm_choices = {}
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @volume.available_vms.each { |vm| @vm_choices[vm.name] = vm.id }

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Attach Cloud Volume \"%{name}\"") % {:name => @volume.name},
      :url  => "/cloud_volume/attach"
    )
  end

  def clone
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("cloud_volume_clone")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Clone Cloud Volume \"%{name}\"") % {:name => @volume.name},
      :url  => "/cloud_volume/clone/"
    )
  end

  def detach
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("cloud_volume_detach")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @vm_choices = @volume.vms.each_with_object({}) { |vm, hash| hash[vm.name] = vm.id }

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Detach Cloud Volume \"%{name}\"") % {:name => @volume.name},
      :url  => "/cloud_volume/detach"
    )
  end

  def new
    assert_privileges("cloud_volume_new")
    assert_privileges("cloud_tenant_show_list")

    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(
      :name => _("Add New Cloud Volume"),
      :url  => "/cloud_volume/new"
    )
  end

  def create
    assert_privileges("cloud_volume_new")
    case params[:button]
    when "cancel"
      flash_and_redirect(_("Add of new Cloud Volume was cancelled by the user"))

    when "add"
      @volume = CloudVolume.new
      options = form_params_create
      ext_management_system = options.delete(:ems)
      if ext_management_system.supports?(:cloud_volume_create)
        task_id = CloudVolume.create_volume_queue(session[:userid], ext_management_system, options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        else
          add_flash(_("Cloud Volume creation failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        @in_a_form = true
        add_flash(ext_management_system.unsupported_reason(:cloud_volume_create), :error)
        drop_breadcrumb(
          :name => _("Add New Cloud Volume"),
          :url  => "/cloud_volume/new"
        )
        javascript_flash(:spinner_off => true)
      end

    when "validate"
      @in_a_form = true
      options = form_params
      cloud_tenant = find_record_with_rbac(CloudTenant, options[:cloud_tenant_id])
      ext_management_system = cloud_tenant.ext_management_system
      if ext_management_system.supports?(:cloud_volume_create)
        add_flash(_("Validation successful"))
      else
        add_flash(ext_management_system.unsupported_reason(:cloud_volume_create), :error)
      end
      javascript_flash
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    volume_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Cloud Volume \"%{name}\" created") % {
        :name => volume_name
      })
    else
      add_flash(_("Unable to create Cloud Volume \"%{name}\": %{details}") % {
        :name    => volume_name,
        :details => task.message
      }, :error)
    end

    session[:edit] = nil
    flash_to_session
    javascript_redirect(previous_breadcrumb_url)
  end

  def edit
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("cloud_volume_edit")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Cloud Volume \"%{name}\"") % {:name => @volume.name},
      :url  => "/cloud_volume/edit/#{@volume.id}"
    )
  end

  def update
    assert_privileges("cloud_volume_edit")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      flash_and_redirect(_("Edit of Cloud Volume \"%{name}\" was cancelled by the user") % {:name => @volume.name})

    when "save"
      options = form_params
      if @volume.supports?(:update)
        task_id = @volume.update_volume_queue(session[:userid], options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
        else
          add_flash(_("Cloud Volume update failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        add_flash(_(@volume.unsupported_reason(:update)), :error) unless validate_results[:message].nil?
        javascript_flash
      end

    when "validate"
      @in_a_form = true
      if @volume.supports?(:update)
        add_flash(_("Validation successful"))
      else
        add_flash(_(@volume.unsupported_reason(:update)), :error)
      end
    end
  end

  def update_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    volume_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Cloud Volume \"%{name}\" updated") % {
        :name => volume_name
      })
    else
      add_flash(_("Unable to update Cloud Volume \"%{name}\": %{details}") % {
        :name    => volume_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => volume_id)
  end

  def backup_new
    assert_privileges("cloud_volume_backup_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Create Backup for Cloud Volume \"%{name}\"") % {:name => @volume.name},
      :url  => "/cloud_volume/backup_new/#{@volume.id}"
    )
  end

  def backup_select
    assert_privileges("cloud_volume_backup_restore")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @backup_choices = {}
    @volume.cloud_volume_backups.each do |backup|
      @backup_choices[backup.name] = backup.id
    end
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Restore Cloud Volume \"%{name}\" from a Backup") % {:name => @volume.name},
      :url  => "/cloud_volume/backup_select/#{@volume.id}"
    )
  end

  def snapshot_new
    assert_privileges("cloud_volume_snapshot_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Create Snapshot for Cloud Volume \"%{name}\"") % {
        :name => @volume.name
      },
      :url  => "/cloud_volume/snapshot_new/#{@volume.id}"
    )
  end

  def download_data
    assert_privileges('cloud_volume_view')
    super
  end

  def download_summary_pdf
    assert_privileges('cloud_volume_view')
    super
  end

  private

  def textual_group_list
    [%i[properties mappings relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def form_params
    options = copy_params_if_set({}, params, %i[name size cloud_tenant_id vm_id device_path])
    options[:volume_type] = params[:volume_type] if params[:volume_type]
    # Only set IOPS if io1 (provisioned IOPS) and IOPS available
    options[:iops] = params[:aws_iops] if options[:volume_type] == 'io1' && params[:aws_iops]
    options
  end

  def form_params_create
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:size] = params[:size].to_i if params[:size]

    # Depending on the storage manager type, collect required form params.
    case params[:emstype]
    when "ManageIQ::Providers::Openstack::StorageManager::CinderManager"
      options.merge!(cinder_manager_options)
    when "ManageIQ::Providers::Amazon::StorageManager::Ebs"
      options.merge!(aws_ebs_options)
    when "ManageIQ::Providers::IbmCloud::PowerVirtualServers::StorageManager"
      options.merge!(ibmcloud_powervs_options)
    when "ManageIQ::Providers::Autosde::StorageManager"
      options.merge!(autosde_options)
    end
    options
  end

  def autosde_options
    {
      :ems             => ExtManagementSystem.find(params[:storage_manager_id]),
      :storage_service => StorageService.find(params[:storage_service_id])
    }
  end

  def cinder_manager_options
    options = {}
    cloud_tenant_id = params[:cloud_tenant_id] if params[:cloud_tenant_id]
    options[:volume_type] = params[:volume_type] if params[:volume_type]
    cloud_tenant = find_record_with_rbac(CloudTenant, cloud_tenant_id)
    options[:cloud_tenant] = cloud_tenant
    options[:ems] = cloud_tenant.ext_management_system.cinder_manager
    options[:availability_zone] = params[:availability_zone_id] if params[:availability_zone_id]
    options
  end

  def aws_ebs_options
    options = {}
    options[:volume_type] = params[:volume_type] if params[:volume_type]
    # Only set IOPS if io1 (provisioned IOPS) and IOPS available
    options[:iops] = params[:aws_iops] if options[:volume_type] == 'io1' && params[:aws_iops]
    options[:availability_zone] = params[:availability_zone_id] if params[:availability_zone_id]
    options[:snapshot_id] = params[:aws_base_snapshot_id] if params[:aws_base_snapshot_id]
    options[:encrypted] = params[:aws_encryption]

    # Get the storage manager.
    storage_manager_id = params[:storage_manager_id] if params[:storage_manager_id]
    options[:ems] = find_record_with_rbac(ExtManagementSystem, storage_manager_id)
    options
  end

  def ibmcloud_powervs_options
    options = {}
    options[:volume_type] = params[:volume_type] if params[:volume_type]
    storage_manager_id = params[:storage_manager_id] if params[:storage_manager_id]
    options[:ems] = find_record_with_rbac(ExtManagementSystem, storage_manager_id)
    options
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Volumes"), :url => controller_url},
      ],
      :record_info => @volume,
    }.compact
  end

  menu_section :bst

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  has_custom_buttons
end
