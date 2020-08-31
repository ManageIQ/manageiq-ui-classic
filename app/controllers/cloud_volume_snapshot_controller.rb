class CloudVolumeSnapshotController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[based_volumes]
  end

  def display_based_volumes
    nested_list(CloudVolume, :association => :based_volumes)
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  # handle buttons pressed on the button bar
  def specific_buttons(pressed)
    if pressed == 'cloud_volume_snapshot_delete'
      delete_cloud_volume_snapshots
      return true
    end
    false
  end

  def delete_cloud_volume_snapshots
    assert_privileges("cloud_volume_snapshot_delete")

    snapshots = find_records_with_rbac(CloudVolumeSnapshot, checked_or_params)
    process_cloud_volume_snapshots(snapshots, "destroy")

    # refresh the list if applicable
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "cloud_volume_snapshot"
      @single_delete = true unless flash_errors?
      if @flash_array.nil?
        add_flash(_("The selected Cloud Volume Snapshot was deleted"))
      end
    end
    render_flash
  end

  # dispatches tasks to multiple snapshots
  def process_cloud_volume_snapshots(snapshots, task)
    return if snapshots.empty?

    if task == "destroy"
      snapshots.each do |snapshot|
        audit = {
          :event        => "cloud_volume_snapshot_record_delete_initiateed",
          :message      => "[#{snapshot.name}] Record delete initiated",
          :target_id    => snapshot.id,
          :target_class => "CloudVolumeSnapshot",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        snapshot.delete_snapshot_queue(session[:userid])
      end
      add_flash(n_("Delete initiated for %{number} Cloud Volume Snapshot.",
                   "Delete initiated for %{number} Cloud Volume Snapshots.",
                   snapshots.length) % {:number => snapshots.length})
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Block Storage")},
        {:title => _("Volume Snapshots")},
        {:url   => controller_url, :title => _("Cloud Volume Snapshots")},
      ],
    }
  end

  menu_section :bst
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
