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

  def self.display_methods
    %w[cloud_volume_snapshots cloud_volume_backups instances custom_button_events]
  end

  def specific_buttons(pressed)
    case pressed
    when 'cloud_volume_delete'
      @refresh_div = 'main_div'
      delete_volumes
      return false
    when 'cloud_volume_attach'
      volume = find_record_with_rbac(CloudVolume, checked_item_id)
      if !volume.is_available?(:attach_volume) || volume.status != "available"
        render_flash(_("Cloud Volume \"%{volume_name}\" is not available to be attached to any Instances") % {:volume_name => volume.name}, :error)
      else
        javascript_redirect(:action => 'attach', :id => checked_item_id)
      end
    when 'cloud_volume_detach'
      volume = find_record_with_rbac(CloudVolume, checked_item_id)
      if volume.attachments.empty?
        render_flash(_("Cloud Volume \"%{volume_name}\" is not attached to any Instances") % {:volume_name => volume.name}, :error)
      else
        javascript_redirect(:action => 'detach', :id => checked_item_id)
      end
    when 'cloud_volume_edit'
      javascript_redirect(:action => 'edit', :id => checked_item_id)
    when 'cloud_volume_snapshot_create'
      validate_results = validate_item_supports_action_button(:snapshot_create, CloudVolume)
      if validate_results[:action_supported] then javascript_redirect(:action => 'snapshot_new', :id => checked_item_id) end
    when 'cloud_volume_new'
      javascript_redirect(:action => 'new')
    when 'cloud_volume_backup_create'
      validate_results = validate_item_supports_action_button(:backup_create, CloudVolume)
      if validate_results[:action_supported] then javascript_redirect(:action => 'backup_new', :id => checked_item_id) end
    when 'cloud_volume_backup_restore'
      validate_results = validate_item_supports_action_button(:backup_restore, CloudVolume)
      if validate_results[:action_supported] then javascript_redirect(:action => 'backup_select', :id => checked_item_id) end
    when 'cloud_volume_safe_delete'
      validate_results = validate_item_supports_action_button(:safe_delete, CloudVolume)
      if validate_results[:action_supported]
        @refresh_div = 'main_div'
        safe_delete_volumes
        return false
      end
    else
      return false
    end

    if validate_results && validate_results[:message]
      render_flash(validate_results[:message], :error)
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

  def attach_volume
    assert_privileges("cloud_volume_attach")

    @volume = find_record_with_rbac(CloudVolume, params[:id])
    case params[:button]
    when "cancel"
      flash_and_redirect(_("Attaching Cloud Volume \"%{name}\" was cancelled by the user") % {
        :name => @volume.name
      })
    when "attach"
      options = form_params
      vm = find_record_with_rbac(VmCloud, options[:vm_id])
      if @volume.is_available?(:attach_volume)
        task_id = @volume.attach_volume_queue(session[:userid], vm.ems_ref, options[:device_path])

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "attach_finished")
        else
          add_flash(_("Attaching Cloud volume failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        add_flash(_(volume.is_available_now_error_message(:attach_volume)), :error)
        javascript_flash
      end
    end
  end

  def attach_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    volume_name = session[:async][:params][:name]
    vm_id = session[:async][:params][:vm_id]
    vm = find_record_with_rbac(VmCloud, vm_id)
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Attaching Cloud Volume \"%{volume_name}\" to %{vm_name} finished") % {
        :volume_name => volume_name,
        :vm_name     => vm.name
      })
    else
      add_flash(_("Unable to attach Cloud Volume \"%{volume_name}\" to %{vm_name}: %{details}") % {
        :volume_name => volume_name,
        :vm_name     => vm.name,
        :details     => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => volume_id)
  end

  def detach_volume
    assert_privileges("cloud_volume_detach")

    @volume = find_record_with_rbac(CloudVolume, params[:id])
    case params[:button]
    when "cancel"
      flash_and_redirect(_("Detaching Cloud Volume \"%{name}\" was cancelled by the user") % {
        :name => @volume.name
      })

    when "detach"
      options = form_params
      vm = find_record_with_rbac(VmCloud, options[:vm_id])
      if @volume.is_available?(:detach_volume)
        task_id = @volume.detach_volume_queue(session[:userid], vm.ems_ref)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "detach_finished")
        else
          add_flash(_("Detaching Cloud volume failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        add_flash(_(@volume.is_available_now_error_message(:detach_volume)), :error)
        javascript_flash(:spinner_off => true)
      end
    end
  end

  def detach_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    volume_name = session[:async][:params][:name]
    vm_id = session[:async][:params][:vm_id]
    vm = find_record_with_rbac(VmCloud, vm_id)
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Detaching Cloud Volume \"%{volume_name}\" from %{vm_name} finished") % {
        :volume_name => volume_name,
        :vm_name     => vm.name
      })
    else
      add_flash(_("Unable to detach Cloud Volume \"%{volume_name}\" from %{vm_name}: %{details}") % {
        :volume_name => volume_name,
        :vm_name     => vm.name,
        :details     => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => volume_id)
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
      validate_results = CloudVolume.validate_create_volume(ext_management_system)
      if validate_results[:available]

        task_id = CloudVolume.create_volume_queue(session[:userid], ext_management_system, options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        else
          add_flash(_("Cloud Volume creation failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        @in_a_form = true
        add_flash(_(validate_results[:message]), :error) unless validate_results[:message].nil?
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
      validate_results = CloudVolume.validate_create_volume(cloud_tenant.ext_management_system)
      if validate_results[:available]
        add_flash(_("Validation successful"))
      else
        add_flash(_(validate_results[:message]), :error) unless validate_results[:message].nil?
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
      validate_results = @volume.validate_update_volume
      if validate_results[:available]
        task_id = @volume.update_volume_queue(session[:userid], options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
        else
          add_flash(_("Cloud Volume update failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        add_flash(_(validate_results[:message]), :error) unless validate_results[:message].nil?
        javascript_flash
      end

    when "validate"
      @in_a_form = true
      validate_results = @volume.validate_update_volume
      if validate_results[:available]
        add_flash(_("Validation successful"))
      else
        add_flash(_(validate_results[:message]), :error) unless validate_results[:message].nil?
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

  # delete selected volumes
  def safe_delete_volumes
    assert_privileges("cloud_volume_delete")
    volumes = find_records_with_rbac(CloudVolume, checked_or_params)

    volumes_to_safe_delete = []
    volumes.each do |volume|
      if volume.nil?
        add_flash(_("Cloud Volume no longer exists."), :error)
      elsif !volume.attachments.empty?
        add_flash(_("Cloud Volume \"%{name}\" cannot be removed because it is attached to one or more Instances") %
                      {:name => volume.name}, :warning)
      else
        valid_safe_delete = volume.validate_safe_delete_volume
        if valid_safe_delete[:available]
          volumes_to_safe_delete.push(volume)
        else
          add_flash(_("Couldn't initiate deletion of Cloud Volume \"%{name}\": %{details}") %
                        {:name    => volume.name,
                         :details => valid_delete[:message]}, :error)
        end
      end
    end
    safe_delete_cloud_volumes(volumes_to_safe_delete) unless volumes_to_safe_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list" && @breadcrumbs.last[:url].include?(@lastaction)
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "cloud_volume"
      @single_delete = true unless flash_errors? || flash_warnings?
    else
      drop_breadcrumb(:name => 'dummy', :url => " ") # missing a bc to get correctly back so here's a dummy
      flash_to_session
      redirect_to(previous_breadcrumb_url)
    end
  end

  # delete selected volumes
  def delete_volumes
    assert_privileges("cloud_volume_delete")
    volumes = find_records_with_rbac(CloudVolume, checked_or_params)

    volumes_to_delete = []
    volumes.each do |volume|
      if volume.nil?
        add_flash(_("Cloud Volume no longer exists."), :error)
      elsif !volume.attachments.empty?
        add_flash(_("Cloud Volume \"%{name}\" cannot be removed because it is attached to one or more Instances") %
          {:name => volume.name}, :warning)
      else
        valid_delete = volume.validate_delete_volume
        if valid_delete[:available]
          volumes_to_delete.push(volume)
        else
          add_flash(_("Couldn't initiate deletion of Cloud Volume \"%{name}\": %{details}") %
            {:name    => volume.name,
             :details => valid_delete[:message]}, :error)
        end
      end
    end
    delete_cloud_volumes(volumes_to_delete) unless volumes_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list" && last_screen_url.include?(@lastaction)
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "cloud_volume"
      @single_delete = true unless flash_errors? || flash_warnings?
    else
      drop_breadcrumb(:name => 'dummy', :url => " ") # missing a bc to get correctly back so here's a dummy
      flash_to_session
      redirect_to(previous_breadcrumb_url)
    end
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

  def backup_create
    assert_privileges("cloud_volume_backup_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      flash_and_redirect(_("Backup of Cloud Volume \"%{name}\" was cancelled by the user") % {:name => @volume.name})

    when "create"
      options = {}
      options[:name] = params[:backup_name] if params[:backup_name]
      options[:incremental] = true if params[:incremental] == "true"
      options[:force] = true if params[:force] == "true"

      task_id = @volume.backup_create_queue(session[:userid], options)

      if task_id.kind_of?(Integer)
        initiate_wait_for_task(:task_id => task_id, :action => "backup_create_finished")
      else
        javascript_flash(
          :text        => _("Cloud volume backup creation failed: Task start failed: ID [%{id}]") %
            {:id => task_id.to_s},
          :severity    => :error,
          :spinner_off => true
        )
      end
    end
  end

  def backup_create_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    task = MiqTask.find(task_id)
    @volume = find_record_with_rbac(CloudVolume, volume_id)
    if task.results_ready?
      add_flash(_("Backup for Cloud Volume \"%{name}\" created") % {:name => @volume.name})
    else
      add_flash(_("Unable to create backup for Cloud Volume \"%{name}\": %{details}") % {
        :name    => @volume.name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => @volume.id)
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

  def backup_restore
    assert_privileges("cloud_volume_backup_restore")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      flash_and_redirect(_("Restore of Cloud Volume \"%{name}\" was cancelled by the user") % {:name => @volume.name})

    when "restore"
      @backup = find_record_with_rbac(CloudVolumeBackup, params[:backup_id])
      task_id = @volume.backup_restore_queue(session[:userid], @backup.ems_ref)

      unless task_id.kind_of?(Integer)
        add_flash(_("Cloud volume restore failed: Task start failed: ID [%{id}]") %
                  {:id => task_id.to_s}, :error)
      end

      if @flash_array
        javascript_flash(:spinner_off => true)
      else
        initiate_wait_for_task(:task_id => task_id, :action => "backup_restore_finished")
      end
    end
  end

  def backup_restore_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    task = MiqTask.find(task_id)
    @volume = find_record_with_rbac(CloudVolume, volume_id)
    if task.results_ready?
      add_flash(_("Restoring Cloud Volume \"%{name}\" from backup") % {:name => @volume.name})
    else
      add_flash(_("Unable to restore Cloud Volume \"%{name}\" from backup: %{details}") % {
        :name    => @volume.name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => @volume.id)
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

  def snapshot_create
    assert_privileges("cloud_volume_snapshot_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    case params[:button]
    when "cancel"
      flash_and_redirect(_("Snapshot of Cloud Volume \"%{name}\" was cancelled by the user") % {
        :name => @volume.name
      })
    when "create"
      options = {}
      options[:name] = params[:snapshot_name] if params[:snapshot_name]
      task_id = @volume.create_volume_snapshot_queue(session[:userid], options)
      unless task_id.kind_of?(Integer)
        add_flash(_("Cloud volume snapshot creation failed: Task start failed: ID [%{id}]") %
                  {:id => task_id.to_s}, :error)
      end
      if @flash_array
        javascript_flash(:spinner_off => true)
      else
        initiate_wait_for_task(:task_id => task_id, :action => "snapshot_create_finished")
      end
    end
  end

  def snapshot_create_finished
    task_id = session[:async][:params][:task_id]
    volume_id = session[:async][:params][:id]
    task = MiqTask.find(task_id)
    @volume = find_record_with_rbac(CloudVolume, volume_id)
    if task.results_ready?
      add_flash(_("Snapshot for Cloud Volume \"%{name}\" created") % {
        :name => @volume.name
      })
    else
      add_flash(_("Unable to create snapshot for Cloud Volume \"%{name}\": %{details}") % {
        :name    => @volume.name,
        :details => task.message
      }, :error)
    end
    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => @volume.id)
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
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
    when "ManageIQ::Providers::StorageManager::CinderManager", "ManageIQ::Providers::Openstack::StorageManager::CinderManager"
      options.merge!(cinder_manager_options)
    when "ManageIQ::Providers::Amazon::StorageManager::Ebs"
      options.merge!(aws_ebs_options)
    when "ManageIQ::Providers::Autosde::StorageManager"
      options.merge!(autosde_options)
    end
    options
  end

  def autosde_options
    options = {}
    options[:ems] = ExtManagementSystem.find(params[:storage_manager_id])
    options[:storage_service] = StorageService.find(params[:storage_service_id])
    options
  end

  def cinder_manager_options
    options = {}
    cloud_tenant_id = params[:cloud_tenant_id] if params[:cloud_tenant_id]
    options[:volume_type] = params[:volume_type] if params[:volume_type]
    cloud_tenant = find_record_with_rbac(CloudTenant, cloud_tenant_id)
    options[:cloud_tenant] = cloud_tenant
    options[:ems] = cloud_tenant.ext_management_system
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

  def delete_cloud_volumes(volumes)
    volumes.each do |volume|
      audit = {
        :event        => "cloud_volume_record_delete_initiateed",
        :message      => "[#{volume.name}] Record delete initiated",
        :target_id    => volume.id,
        :target_class => "CloudVolume",
        :userid       => session[:userid]
      }
      AuditEvent.success(audit)
      volume.delete_volume_queue(session[:userid])
    end
    add_flash(n_("Delete initiated for %{number} Cloud Volume.",
                 "Delete initiated for %{number} Cloud Volumes.",
                 volumes.length) % {:number => volumes.length})
  end

  def safe_delete_cloud_volumes(volumes)
    volumes.each do |volume|
      audit = {
        :event        => "cloud_volume_record_safe_delete_initiateed",
        :message      => "[#{volume.name}] Record safe delete initiated",
        :target_id    => volume.id,
        :target_class => "CloudVolume",
        :userid       => session[:userid]
      }
      AuditEvent.success(audit)
      volume.safe_delete_volume_queue(session[:userid])
    end
    add_flash(n_("Safe delete initiated for %{number} Cloud Volume.",
                 "Safe delete initiated for %{number} Cloud Volumes.",
                 volumes.length) % {:number => volumes.length})
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Block Storage")},
        {:title => _("Volumes"), :url => controller_url},
      ],
      :record_info => @volume,
    }.compact
  end

  menu_section :bst

  has_custom_buttons
end
