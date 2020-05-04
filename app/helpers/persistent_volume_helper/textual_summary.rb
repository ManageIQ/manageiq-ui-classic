module PersistentVolumeHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name creation_timestamp resource_version access_modes reclaim_policy status_phase
        storage_medium_type gce_pd_resource git_repository git_revision nfs_server
        iscsi_target_portal iscsi_target_qualified_name iscsi_target_lun_number glusterfs_endpoint_name
        rados_ceph_monitors rados_image_name rados_pool_name rados_user_name rados_keyring
        volume_path fs_type read_only volume_id partition secret_name
      ]
    )
  end

  def textual_group_claim_properties
    @claim = @record.persistent_volume_claim
    TextualGroup.new(_("Volume Claim"), %i[claim_name claim_creation_timestamp desired_access_modes]) if @claim
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[parent pods_using_persistent_volume custom_button_events])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_capacity
    labels = [_("Resource"), _("Quantity")]
    values = (@record.capacity || {}).collect { |type, capacity| [type.to_s, capacity.to_s] }
    TextualMultilabel.new(_("Capacity"), :labels => labels, :values => values)
  end

  #
  # Items
  #
  def textual_pods_using_persistent_volume
    link = url_for_only_path(:id => @record.id, :action => "show", :display => "container_groups")
    textual_link(@record.container_groups, :as => ContainerGroup, :link => link)
  end

  def textual_resource_version
    @record.resource_version
  end

  def textual_access_modes
    @record.access_modes
  end

  def textual_reclaim_policy
    @record.reclaim_policy
  end

  def textual_status_phase
    @record.status_phase
  end

  def textual_storage_medium_type
    type = @record.empty_dir_medium_type
    if type
      {:label => _("Storage Medium Type"),
       :value => type}
    end
  end

  def textual_gce_pd_resource
    name = @record.gce_pd_name
    if name
      {:label => _("GCE PD Resource"),
       :value => name}
    end
  end

  def textual_git_repository
    git_repository = @record.git_repository
    if git_repository
      {:label => _("Git Repository"),
       :value => git_repository}
    end
  end

  def textual_git_revision
    git_revision = @record.git_revision
    if git_revision
      {:label => _("Git Revision"),
       :value => git_revision}
    end
  end

  def textual_nfs_server
    nfs_server = @record.nfs_server
    if nfs_server
      {:label => _("NFS Server"),
       :value => nfs_server}
    end
  end

  def textual_iscsi_target_portal
    target_portal = @record.iscsi_target_portal
    if target_portal
      {:label => _("ISCSI Target Portal"),
       :value => target_portal}
    end
  end

  def textual_iscsi_target_qualified_name
    iscsi_iqn = @record.iscsi_iqn
    if iscsi_iqn
      {:label => _("ISCSI Target Qualified Name"),
       :value => iscsi_iqn}
    end
  end

  def textual_iscsi_target_lun_number
    iscsi_lun = @record.iscsi_lun
    if iscsi_lun
      {:label => _("ISCSI Target Lun Number"),
       :value => iscsi_lun}
    end
  end

  def textual_glusterfs_endpoint_name
    name = @record.glusterfs_endpoint_name
    if name
      {:label => _("Glusterfs Endpoint Name"),
       :value => name}
    end
  end

  def textual_rados_ceph_monitors
    ceph_monitors = @record.rbd_ceph_monitors
    if ceph_monitors.present?
      {
        :label => _("Rados Ceph Monitors"),
        :value => ceph_monitors
      }
    end
  end

  def textual_rados_image_name
    rbd_image = @record.rbd_image
    if rbd_image
      {:label => _("Rados Image Name"),
       :value => rbd_image}
    end
  end

  def textual_rados_pool_name
    rbd_pool = @record.rbd_pool
    if rbd_pool
      {:label => _("Rados Pool Name"),
       :value => rbd_pool}
    end
  end

  def textual_rados_user_name
    rados_user = @record.rbd_rados_user
    if rados_user
      {:label => _("Rados User Name"),
       :value => rados_user}
    end
  end

  def textual_rados_keyring
    rbd_keyring = @record.rbd_keyring
    if rbd_keyring
      {:label => _("Rados Keyring"),
       :value => rbd_keyring}
    end
  end

  def textual_volume_path
    {:label => _("Volume path"),
     :value => @record.common_path}
  end

  def textual_fs_type
    fs_type = @record.common_fs_type
    if fs_type
      {:label => _("FS Type"),
       :value => fs_type}
    end
  end

  def textual_read_only
    read_only = @record.common_read_only
    if read_only
      {:label => _("Read-Only"),
       :value => read_only}
    end
  end

  def textual_volume_id
    volume_id = @record.common_volume_id
    if volume_id
      {:label => _("Volume ID"),
       :value => volume_id}
    end
  end

  def textual_partition
    @record.common_partition
  end

  def textual_secret_name
    @record.common_secret
  end

  def textual_claim_name
    {:label => _("Name"),
     :value => @claim.name}
  end

  def textual_claim_creation_timestamp
    {:label => _("Creation timestamp"),
     :value => format_timezone(@claim.ems_created_on)}
  end

  def textual_desired_access_modes
    {:label => _("Desired access modes"),
     :value => @claim.desired_access_modes.join(',')}
  end
end
