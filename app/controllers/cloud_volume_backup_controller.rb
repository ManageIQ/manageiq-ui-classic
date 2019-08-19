class CloudVolumeBackupController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def volume_select
    assert_privileges("cloud_volume_backup_restore_to_volume")

    backup_id = params[:id]

    @backup = find_record_with_rbac(CloudVolumeBackup, backup_id)
    @in_a_form = true

    drop_breadcrumb(
      :name => _("Restore Cloud Volume Backup \"%{name}\"") % {:name => @backup.name},
      :url  => "/cloud_volume_backup/volume_select/#{@backup.id}"
    )
  end

  def volume_form_choices
    assert_privileges("cloud_volume_backup_restore_to_volume")
    volume_choices = CloudVolume.all
    volume_choices.each do |volume|
      {:name => volume.name, :id => volume.id}
    end
    render :json => {:volume_choices => volume_choices}
  end

  def backup_restore
    assert_privileges("cloud_volume_backup_restore_to_volume")
    @backup = find_record_with_rbac(CloudVolumeBackup, params[:id])
    case params[:button]
    when "cancel"
      cancel_action(_("Restore to Cloud Volume \"%{name}\" was cancelled by the user") % {:name => @backup.name})

    when "restore"
      # volume_id to restore to is optional
      volume_id = params[:volume].try(:fetch, :ems_ref, nil)
      new_volume_name = params[:name]
      task_id = @backup.restore_queue(session[:userid], volume_id, new_volume_name)

      if task_id.kind_of?(Integer)
        initiate_wait_for_task(:task_id => task_id, :action => "backup_restore_finished")
      else
        add_flash(_("Cloud volume restore failed: Task start failed"), :error)
        javascript_flash(:spinner_off => true)
      end
    end
  end

  def backup_restore_finished
    task = MiqTask.find(session[:async][:params][:task_id])
    @backup = find_record_with_rbac(CloudVolumeBackup, session[:async][:params][:id])

    if task.results_ready?
      add_flash(_("Restoring Cloud Volume \"%{name}\"") % {:name => @backup.name})
    else
      add_flash(_("Unable to restore Cloud Volume \"%{name}\": %{details}") % {
        :name    => @backup.name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show", :id => @backup.id)
  end

  def button
    if params[:pressed] == 'cloud_volume_backup_restore_to_volume'
      javascript_redirect(:action => 'volume_select', :id => checked_item_id)
    elsif params[:pressed] == 'cloud_volume_backup_delete'
      backups_delete
    elsif params[:pressed] == 'cloud_volume_backup_tag'
      tag("CloudVolumeBackup")
    end
  end

  private

  def backups_delete
    assert_privileges('cloud_volume_backup_delete')
    backups = find_records_with_rbac(CloudVolumeBackup, checked_or_params)
    backups.each do |backup|
      begin
        backup.delete_queue(session[:userid])
        add_flash(_("Delete of Backup \"%{name}\" was successfully initiated.") % {:name => backup.name})
      rescue => error
        add_flash(_("Unable to delete Backup \"%{name}\": %{details}") % {:name    => backup.name,
                                                                          :details => error},
                  :error)
      end
    end
    session[:flash_msgs] = @flash_array
    javascript_redirect(:action => 'show_list')
  end

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end

  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Block Storage")},
        {:title => _("Volume Backups"), :url => controller_url},
      ],
    }
  end

  menu_section :bst
end
