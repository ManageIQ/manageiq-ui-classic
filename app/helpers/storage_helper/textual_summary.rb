module StorageHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[store_type free_space used_space total_space])
  end

  def textual_group_registered_vms
    TextualGroup.new(_("Information for Registered VMs"), %i[uncommitted_space used_uncommitted_space])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[hosts managed_vms managed_miq_templates registered_vms unregistered_vms unmanaged_vms custom_button_events]
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_content
    return nil if @record["total_space"].nil?
    TextualGroup.new(_("Content"), %i[files disk_files snapshot_files vm_ram_files vm_misc_files debris_files])
  end

  #
  # Items
  #

  def textual_store_type
    {:label => _("Datastore Type"), :value => @record.store_type}
  end

  def textual_free_space
    return nil if @record["free_space"].nil? && @record["total_space"].nil?
    return nil if @record["free_space"].nil?
    {:label => _("Free Space"),
     :value => "#{number_to_human_size(@record["free_space"], :precision => 2)} "\
               "(#{@record.free_space_percent_of_total}%)"}
  end

  def textual_used_space
    return nil if @record["free_space"].nil? && @record["total_space"].nil?
    {:label => _("Used Space"),
     :value => "#{number_to_human_size(@record.used_space, :precision => 2)} (#{@record.used_space_percent_of_total}%)"}
  end

  def textual_total_space
    return nil if @record["free_space"].nil? && @record["total_space"].nil?
    return nil if @record["total_space"].nil?
    {:label => _("Total Space"), :value => "#{number_to_human_size(@record["total_space"], :precision => 2)} (100%)"}
  end

  def textual_uncommitted_space
    return nil if @record["total_space"].nil?
    space = if @record["uncommitted"].blank?
              _("None")
            else
              number_to_human_size(@record["uncommitted"], :precision => 2)
            end
    {:label => _("Uncommitted Space"), :value => space}
  end

  def textual_used_uncommitted_space
    return nil if @record["total_space"].nil?
    {:label => _("Used + Uncommitted Space"),
     :value => "#{number_to_human_size(@record.v_total_provisioned, :precision => 2)} "\
               "(#{@record.v_provisioned_percent_of_total}%)"}
  end

  def textual_hosts
    label = _("Hosts")
    num   = @record.number_of(:hosts)
    h     = {:label => label, :icon => "pficon pficon-container-node", :value => num}
    if num.positive? && role_allows?(:feature => "host_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'hosts')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_managed_vms
    label = _("Managed VMs")
    num   = @record.number_of(:all_vms)
    h     = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'all_vms')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_managed_miq_templates
    num   = @record.number_of(:all_miq_templates)
    h     = {:label => _("Managed VM Templates"), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "miq_template_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'all_miq_templates')
      h[:title] = _("Show all Managed VM Templates")
    end
    h
  end

  def textual_registered_vms
    value = @record.total_managed_registered_vms
    h = {:label => _("Managed/Registered VMs"),
         :icon  => "pficon pficon-virtual-machine",
         :value => value}
    if value.positive? && role_allows?(:feature => "vm_show_list")
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'registered_vms')
      h[:title] = _("Show all Managed/Registered VMs")
    end
    h
  end

  def textual_unregistered_vms
    value = @record.total_unregistered_vms
    h = {:label => _("Managed/Unregistered VMs"),
         :icon  => "pficon pficon-virtual-machine",
         :value => value}
    if value.positive? && role_allows?(:feature => "vm_show_list")
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'unregistered_vms')
      h[:title] = _("Show all Managed/Unregistered VMs")
    end
    h
  end

  # Unmanaged VMs no longer exist but their number is known
  def textual_unmanaged_vms
    {:label => _("Unmanaged VMs"),
     :icon  => "pficon pficon-virtual-machine",
     :value => @record.total_unmanaged_vms,
     :title => _("Unmanaged VMs are no longer available")}
  end

  def textual_files
    num   = @record.number_of(:files)
    h     = {:label => _("All Files"), :icon => "fa fa-file-o", :value => num}
    if num.positive?
      h[:title] = _("Show all files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'files', :id => @record)
    end
    h
  end

  def textual_format_used_space(number, percentage, amount)
    return 0 if amount.zero?

    n_("%{number} (%{percentage} of Used Space, %{amount} file)",
       "%{number} (%{percentage} of Used Space, %{amount} files)",
       amount) % {
         :number     => number_to_human_size(number, :precision => 2),
         :percentage => percentage.to_s + '%',
         :amount     => amount
       }
  end

  def textual_disk_files
    value = textual_format_used_space(
      @record.v_total_disk_size,
      @record.v_disk_percent_of_used,
      num = @record.number_of(:disk_files)
    )
    h = {:label => _("VM Provisioned Disk Files"), :icon => "fa fa-file-o", :value => value}
    if num.positive?
      h[:title] = _("Show VM Provisioned Disk Files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'disk_files', :id => @record)
    end
    h
  end

  def textual_snapshot_files
    value = textual_format_used_space(
      @record.v_total_snapshot_size,
      @record.v_snapshot_percent_of_used,
      num = @record.number_of(:snapshot_files)
    )
    h = {:label => _("VM Snapshot Files"), :icon => "fa fa-file-o", :value => value}
    if num.positive?
      h[:title] = _("Show VM Snapshot Files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'snapshot_files', :id => @record)
    end
    h
  end

  def textual_vm_ram_files
    value = textual_format_used_space(
      @record.v_total_memory_size,
      @record.v_memory_percent_of_used,
      num = @record.number_of(:vm_ram_files)
    )
    h = {:label => _("VM Memory Files"), :icon => "fa fa-file-o", :value => value}
    if num.positive?
      h[:title] = _("Show VM Memory Files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'vm_ram_files', :id => @record)
    end
    h
  end

  def textual_vm_misc_files
    value = textual_format_used_space(
      @record.v_total_vm_misc_size,
      @record.v_vm_misc_percent_of_used,
      num = @record.number_of(:vm_misc_files)
    )
    h = {:label => _("Other VM Files"), :icon => "fa fa-file-o", :value => value}
    if num.positive?
      h[:title] = _("Show Other VM Files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'vm_misc_files', :id => @record)
    end
    h
  end

  def textual_debris_files
    value = textual_format_used_space(
      @record.v_total_debris_size,
      @record.v_debris_percent_of_used,
      num = @record.number_of(:debris_files)
    )
    h = {:label => _("Non-VM Files"), :icon => "fa fa-file-o", :value => value}
    if num.positive?
      h[:title] = _("Show Non-VM Files installed on this Datastore")
      h[:link]  = url_for_only_path(:action => 'debris_files', :id => @record)
    end
    h
  end

  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    {
      :label => _('Custom Button Events'),
      :value => num = @record.number_of(:custom_button_events),
      :link  => num.positive? ? url_for_only_path(:action => 'show', :id => @record, :display => 'custom_button_events') : nil,
      :icon  => CustomButtonEvent.decorate.fonticon
    }
  end
end
