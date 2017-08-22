class CloudVolumeController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.display_methods
    %w(cloud_volume_snapshots cloud_volume_backups instances)
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w(instances).include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    if params[:pressed] == "custom_button"
      custom_buttons
      return
    end

    if params[:pressed].starts_with?("instance_") # support for instance_ buttons
      pfx = pfx_for_vm_button_pressed(params[:pressed])
      process_vm_buttons(pfx)
      # Control transferred to another screen, so return
      return if vm_button_redirected?(pfx, params[:pressed])

      unless ["#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone",
              "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
        show # will render show?display=instances
      end
    else
      @refresh_div = "main_div"
      return tag("CloudVolume") if params[:pressed] == "cloud_volume_tag"
      delete_volumes if params[:pressed] == 'cloud_volume_delete'
    end

    if params[:pressed] == "cloud_volume_attach"
      javascript_redirect :action => "attach", :id => checked_item_id
    elsif params[:pressed] == "cloud_volume_detach"
      @volume = find_record_with_rbac(CloudVolume, checked_item_id)
      if @volume.attachments.empty?
        render_flash(_("%{volume} \"%{volume_name}\" is not attached to any %{instances}") % {
                     :volume      => ui_lookup(:table => 'cloud_volume'),
                     :volume_name => @volume.name,
                     :instances   => ui_lookup(:tables => 'vm_cloud')}, :error)
      else
        javascript_redirect :action => "detach", :id => checked_item_id
      end
    elsif params[:pressed] == "cloud_volume_edit"
      javascript_redirect :action => "edit", :id => checked_item_id
    elsif params[:pressed] == "cloud_volume_snapshot_create"
      javascript_redirect :action => "snapshot_new", :id => checked_item_id
    elsif params[:pressed] == "cloud_volume_new"
      javascript_redirect :action => "new"
    elsif params[:pressed] == "cloud_volume_backup_create"
      javascript_redirect :action => "backup_new", :id => checked_item_id
    elsif params[:pressed] == "cloud_volume_backup_restore"
      javascript_redirect :action => "backup_select", :id => checked_item_id
    elsif !flash_errors? && @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    elsif params[:pressed].ends_with?("_edit") || ["#{pfx}_miq_request_new", "#{pfx}_clone",
                                                   "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
      render_or_redirect_partial(pfx)
    else
      render_flash
    end
  end

  def attach
    params[:id] = checked_item_id unless params[:id].present?
    assert_privileges("cloud_volume_attach")
    @vm_choices = {}
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @volume.available_vms.each { |vm| @vm_choices[vm.name] = vm.id }

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Attach %{model} \"%{name}\"") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      },
      :url  => "/cloud_volume/attach")
  end

  def detach
    params[:id] = checked_item_id unless params[:id].present?
    assert_privileges("cloud_volume_detach")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @vm_choices = @volume.vms.each_with_object({}) { |vm, hash| hash[vm.name] = vm.id }

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Detach %{model} \"%{name}\"") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      },
      :url  => "/cloud_volume/detach")
  end

  def attach_volume
    assert_privileges("cloud_volume_attach")

    @volume = find_record_with_rbac(CloudVolume, params[:id])
    case params[:button]
    when "cancel"
      cancel_action(_("Attaching %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
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

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => volume_id
  end

  def detach_volume
    assert_privileges("cloud_volume_detach")

    @volume = find_record_with_rbac(CloudVolume, params[:id])
    case params[:button]
    when "cancel"
      cancel_action(_("Detaching %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
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
        add_flash(_(volume.is_available_now_error_message(:detach_volume)), :error)
        javascript_flash
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

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => volume_id
  end

  def new
    assert_privileges("cloud_volume_new")
    @volume = CloudVolume.new
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(
      :name => _("Add New %{model}") % {:model => ui_lookup(:table => 'cloud_volume')},
      :url  => "/cloud_volume/new"
    )
  end

  def create
    assert_privileges("cloud_volume_new")
    case params[:button]
    when "cancel"
      cancel_action(_("Add of new %{model} was cancelled by the user") % {:model => ui_lookup(:table => 'cloud_volume')})

    when "add"
      @volume = CloudVolume.new
      options = form_params_create
      ext_management_system = options.delete(:ems)
      valid_action, action_details = CloudVolume.validate_create_volume(ext_management_system)
      if valid_action
        task_id = CloudVolume.create_volume_queue(session[:userid], ext_management_system, options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        else
          add_flash(_("Cloud Volume creation failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        @in_a_form = true
        add_flash(_(action_details), :error) unless action_details.nil?
        drop_breadcrumb(
          :name => _("Add New %{model}") % {:model => ui_lookup(:table => 'cloud_volume')},
          :url  => "/cloud_volume/new"
        )
        javascript_flash
      end

    when "validate"
      @in_a_form = true
      options = form_params
      cloud_tenant = find_record_with_rbac(CloudTenant, options[:cloud_tenant_id])
      valid_action, action_details = CloudVolume.validate_create_volume(cloud_tenant.ext_management_system)
      if valid_action
        add_flash(_("Validation successful"))
      else
        add_flash(_(action_details), :error) unless details.nil?
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
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect previous_breadcrumb_url
  end

  def edit
    params[:id] = checked_item_id unless params[:id].present?
    assert_privileges("cloud_volume_edit")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit %{model} \"%{name}\"") % {:model => ui_lookup(:table => 'cloud_volume'), :name => @volume.name},
      :url  => "/cloud_volume/edit/#{@volume.id}"
    )
  end

  def update
    assert_privileges("cloud_volume_edit")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Edit of %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      })

    when "save"
      options = form_params
      valid_update, update_details = @volume.validate_update_volume
      if valid_update
        task_id = @volume.update_volume_queue(session[:userid], options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
        else
          add_flash(_("Cloud Volume update failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        add_flash(_(update_details), :error)
        javascript_flash
      end

    when "validate"
      @in_a_form = true
      options = form_params
      cloud_tenant = find_record_with_rbac(CloudTenant, options[:cloud_tenant_id])
      valid_action, action_details = CloudVolume.validate_create_volume(cloud_tenant.ext_management_system)
      if valid_action
        add_flash(_("Validation successful"))
      else
        add_flash(_(action_details), :error) unless details.nil?
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

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show", :id => volume_id
  end

  # delete selected volumes
  def delete_volumes
    assert_privileges("cloud_volume_delete")
    volumes = find_records_with_rbac(CloudVolume, checked_or_params)
    if volumes.empty?
      add_flash(_("No %{models} were selected for deletion.") % {
        :models => ui_lookup(:tables => "cloud_volume")
      }, :error)
    end

    volumes_to_delete = []
    volumes.each do |volume|
      if volume.nil?
        add_flash(_("%{model} no longer exists.") % {:model => ui_lookup(:table => "cloud_volume")}, :error)
      elsif !volume.attachments.empty?
        add_flash(_("%{model} \"%{name}\" cannot be removed because it is attached to one or more %{instances}") % {
          :model     => ui_lookup(:table => 'cloud_volume'),
          :name      => volume.name,
          :instances => ui_lookup(:tables => 'vm_cloud')}, :warning)
      else
        valid_delete = volume.validate_delete_volume
        if valid_delete[:available]
          volumes_to_delete.push(volume)
        else
          add_flash(_("Couldn't initiate deletion of %{model} \"%{name}\": %{details}") % {
            :model   => ui_lookup(:table => 'cloud_volume'),
            :name    => volume.name,
            :details => valid_delete[:message]}, :error)
        end
      end
    end
    process_cloud_volumes(volumes_to_delete, "destroy") unless volumes_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list" && @breadcrumbs.last[:url].include?(@lastaction)
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "cloud_volume"
      @single_delete = true unless flash_errors?
      if @flash_array.nil?
        add_flash(_("The selected %{model} was deleted") % {:model => ui_lookup(:table => "cloud_volume")})
      end
    else
      drop_breadcrumb(:name => 'dummy', :url => " ") # missing a bc to get correctly back so here's a dummy
      session[:flash_msgs] = @flash_array.dup if @flash_array
      redirect_to(previous_breadcrumb_url)
    end
  end

  def backup_new
    assert_privileges("cloud_volume_backup_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Create Backup for %{model} \"%{name}\"") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      },
      :url  => "/cloud_volume/backup_new/#{@volume.id}"
    )
  end

  def backup_create
    assert_privileges("cloud_volume_backup_create")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Backup of %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      })

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
      add_flash(_("Backup for %{model} \"%{name}\" created") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      })
    else
      add_flash(_("Unable to create backup for %{model} \"%{name}\": %{details}") % {
        :model   => ui_lookup(:table => 'cloud_volume'),
        :name    => @volume.name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array
    javascript_redirect :action => "show", :id => @volume.id
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
      :name => _("Restore %{model} \"%{name}\" from a Backup") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      },
      :url  => "/cloud_volume/backup_select/#{@volume.id}"
    )
  end

  def backup_restore
    assert_privileges("cloud_volume_backup_restore")
    @volume = find_record_with_rbac(CloudVolume, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Restore of %{model} \"%{name}\" was cancelled by the user") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      })

    when "restore"
      @backup = find_record_with_rbac(CloudVolumeBackup, params[:backup_id])
      task_id = @volume.backup_restore_queue(session[:userid], @backup.ems_ref)

      add_flash(_("Cloud volume restore failed: Task start failed: ID [%{id}]") %
                {:id => task_id.to_s}, :error) unless task_id.kind_of?(Integer)

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
      add_flash(_("Restoring %{model} \"%{name}\" from backup") % {
        :model => ui_lookup(:table => 'cloud_volume'),
        :name  => @volume.name
      })
    else
      add_flash(_("Unable to restore %{model} \"%{name}\" from backup: %{details}") % {
        :model   => ui_lookup(:table => 'cloud_volume'),
        :name    => @volume.name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array
    javascript_redirect :action => "show", :id => @volume.id
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
      cancel_action(_("Snapshot of Cloud Volume \"%{name}\" was cancelled by the user") % {
        :name => @volume.name
      })
    when "create"
      options = {}
      options[:name] = params[:snapshot_name] if params[:snapshot_name]
      task_id = @volume.create_volume_snapshot_queue(session[:userid], options)
      add_flash(_("Cloud volume snapshot creation failed: Task start failed: ID [%{id}]") %
                {:id => task_id.to_s}, :error) unless task_id.kind_of?(Integer)
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
    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array
    javascript_redirect :action => "show", :id => @volume.id
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:size] = params[:size].to_i if params[:size]
    options[:cloud_tenant_id] = params[:cloud_tenant_id] if params[:cloud_tenant_id]
    options[:vm_id] = params[:vm_id] if params[:vm_id]
    options[:device_path] = params[:device_path] if params[:device_path]
    options[:volume_type] = params[:aws_volume_type] if params[:aws_volume_type]
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
    when "ManageIQ::Providers::StorageManager::CinderManager"
      options.merge!(cinder_manager_options)
    when "ManageIQ::Providers::Amazon::StorageManager::Ebs"
      options.merge!(aws_ebs_options)
    end
    options
  end

  def cinder_manager_options
    options = {}
    cloud_tenant_id = params[:cloud_tenant_id] if params[:cloud_tenant_id]
    cloud_tenant = find_record_with_rbac(CloudTenant, cloud_tenant_id)
    options[:cloud_tenant] = cloud_tenant
    options[:ems] = cloud_tenant.ext_management_system
    options
  end

  def aws_ebs_options
    options = {}
    options[:volume_type] = params[:aws_volume_type] if params[:aws_volume_type]
    # Only set IOPS if io1 (provisioned IOPS) and IOPS available
    options[:iops] = params[:aws_iops] if options[:volume_type] == 'io1' && params[:aws_iops]
    options[:availability_zone] = params[:aws_availability_zone_id] if params[:aws_availability_zone_id]
    options[:snapshot_id] = params[:aws_base_snapshot_id] if params[:aws_base_snapshot_id]
    options[:encrypted] = params[:aws_encryption]

    # Get the storage manager.
    storage_manager_id = params[:storage_manager_id] if params[:storage_manager_id]
    options[:ems] = find_record_with_rbac(ExtManagementSystem, storage_manager_id)
    options
  end

  # dispatches tasks to multiple volumes
  def process_cloud_volumes(volumes, task)
    return if volumes.empty?

    if task == "destroy"
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
  end

  menu_section :bst

  has_custom_buttons
end
