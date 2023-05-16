module ContainerGroupHelper::TextualSummary
  #
  # Groups
  #
  include TextualMixins::TextualCustomButtonEvents

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name status message reason creation_timestamp resource_version restart_policy dns_policy ip]
    )
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems container_project container_services container_replicator containers container_node
        lives_on container_images persistent_volumes custom_button_events
      ]
    )
  end

  def textual_group_conditions
    labels = [_("Name"), _("Status")]
    h = {:labels => labels}
    h[:values] = @record.container_conditions.collect do |condition|
      [
        condition.name,
        condition.status,
      ]
    end
    TextualMultilabel.new(_("Conditions"), h)
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  @@key_dictionary = [
    [:empty_dir_medium_type, _('Storage Medium Type')],
    [:gce_pd_name, _('GCE PD Resource')],
    [:git_repository, _('Git Repository')],
    [:git_revision, _('Git Revision')],
    [:nfs_server, _('NFS Server')],
    [:iscsi_target_portal, _('ISCSI Target Portal')],
    [:iscsi_iqn, _('ISCSI Target Qualified Name')],
    [:iscsi_lun, _('ISCSI Target Lun Number')],
    [:glusterfs_endpoint_name, _('Glusterfs Endpoint Name')],
    [:claim_name, _('Persistent Volume Claim Name')],
    [:rbd_ceph_monitors, _('Rados Ceph Monitors')],
    [:rbd_image, _('Rados Image Name')],
    [:rbd_pool, _('Rados Pool Name')],
    [:rbd_rados_user, _('Rados User Name')],
    [:rbd_keyring, _('Rados Keyring')],
    [:common_path, _('Volume Path')],
    [:common_fs_type, _('FS Type')],
    [:common_read_only, _('Read-Only')],
    [:common_volume_id, _('Volume ID')],
    [:common_partition, _('Partition')],
    [:common_secret, _('Secret Name')]
  ]

  def textual_group_volumes
    h = {:labels => [_("Name"), _("Property"), _("Value")], :values => []}
    @record.container_volumes.each do |volume|
      volume_values = @@key_dictionary.collect do |key, name|
        [nil, name, volume[key]] if volume[key].present?
      end.compact
      # Set the volume name only  for the first item in the list
      volume_values[0][0] = volume.name if volume_values.present?
      h[:values] += volume_values
    end
    TextualMultilabel.new(_("Volumes"), h)
  end

  #
  # Items
  #

  def textual_status
    @record.phase
  end

  def textual_message
    @record.message
  end

  def textual_reason
    @record.reason
  end

  def textual_restart_policy
    @record.restart_policy
  end

  def textual_dns_policy
    {:label => _("DNS Policy"), :value => @record.dns_policy}
  end

  def textual_ip
    {:label => _("IP Address"), :value => @record.ipaddress}
  end

  def textual_lives_on
    lives_on_ems = @record.container_node.try(:lives_on).try(:ext_management_system)
    return nil if lives_on_ems.nil?

    # TODO: handle the case where the node is a bare-metal
    lives_on_entity_name = lives_on_ems.kind_of?(EmsCloud) ? _("Instance") : _("Virtual Machine")
    {
      :label => _("Underlying %{name}") % {:name => lives_on_entity_name},
      :image => lives_on_ems.decorate.fileicon,
      :value => @record.container_node.lives_on.name.to_s,
      :link  => url_for_only_path(
        :action     => 'show',
        :controller => 'vm_or_template',
        :id         => @record.container_node.lives_on.id
      )
    }
  end

  def textual_group_container_statuses_summary
    TextualGroup.new(_("Container Statuses Summary"), %i[waiting running terminated])
  end

  def textual_compliance_history
    super(:title => _("Show Compliance History of this Replicator (Last 10 Checks)"))
  end
end
