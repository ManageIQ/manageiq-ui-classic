module ServiceHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  include GenericObjectHelper::TextualSummary

  # Groups

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description guid])
  end

  def textual_group_provisioning_results
    return nil unless provisioning_get_job
    TextualGroup.new(_("Results"), %i[status start_time finish_time elapsed_time owner])
  end

  def textual_group_provisioning_details
    return nil unless provisioning_get_job
    TextualGroup.new(_("Details"), %i[playbook repository verbosity hosts])
  end

  def textual_group_provisioning_credentials
    return nil unless provisioning_get_job
    TextualGroup.new(_("Credentials"), %i[machine_credential vault_credential network_credential cloud_credential])
  end

  def textual_group_provisioning_plays
    return nil unless provisioning_get_job
    fetch_job_plays
  end

  def textual_group_retirement_results
    return nil unless retirement_get_job
    TextualGroup.new(_("Results"), %i[status start_time finish_time elapsed_time owner])
  end

  def textual_group_retirement_details
    return nil unless retirement_get_job
    TextualGroup.new(_("Details"), %i[playbook repository verbosity hosts])
  end

  def textual_group_retirement_credentials
    return nil unless retirement_get_job
    TextualGroup.new(_("Credentials"), %i[machine_credential vault_credential network_credential cloud_credential])
  end

  def textual_group_retirement_plays
    return nil unless retirement_get_job
    fetch_job_plays
  end

  def textual_group_tower_job_results
    return nil unless fetch_job
    TextualGroup.new(_("Results"), %i[status start_time finish_time elapsed_time owner])
  end

  def textual_group_tower_job_details
    return nil unless fetch_job
    TextualGroup.new(_("Details"), %i[verbosity])
  end

  def textual_group_tower_job_credentials
    return nil unless fetch_job
    TextualGroup.new(_("Credentials"), %i[machine_credential vault_credential network_credential cloud_credential])
  end

  def textual_group_tower_job_plays
    return nil unless fetch_job
    return nil unless @job.respond_to?(:job_plays)
    fetch_job_plays
  end

  def textual_group_vm_totals
    TextualGroup.new(
      _("Totals for Service VMs"),
      %i[
        aggregate_all_vm_cpus aggregate_all_vm_memory
        aggregate_all_vm_disk_count aggregate_all_vm_disk_space_allocated
        aggregate_all_vm_disk_space_used aggregate_all_vm_memory_on_disk
      ]
    )
  end

  def textual_group_lifecycle
    TextualGroup.new(_("Lifecycle"), %i[lifecycle_state retirement_date retirement_state owner group created])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[catalog_item parent_service orchestration_stack job custom_button_events])
  end

  def textual_group_miq_custom_attributes
    TextualGroup.new(_("Custom Attributes"), textual_miq_custom_attributes)
  end

  def textual_group_generic_objects
    TextualGroup.new(_("Generic Objects"), %i[generic_object_instances])
  end

  # Items

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_aggregate_all_vm_cpus
    {:label => _("CPU"), :value => @record.aggregate_all_vm_cpus}
  end

  def textual_aggregate_all_vm_memory
    {:label => _("Memory"), :value => number_to_human_size(@record.aggregate_all_vm_memory.try(:megabytes) || 0, :precision => 2)}
  end

  def textual_aggregate_all_vm_disk_count
    {:label => _("Disk Count"), :value => @record.aggregate_all_vm_disk_count}
  end

  def textual_aggregate_all_vm_disk_space_allocated
    {:label => _("Disk Space Allocated"),
     :value => number_to_human_size(@record.aggregate_all_vm_disk_space_allocated || 0, :precision => 2)}
  end

  def textual_aggregate_all_vm_disk_space_used
    {:label => _("Disk Space Used"),
     :value => number_to_human_size(@record.aggregate_all_vm_disk_space_used || 0, :precision => 2)}
  end

  def textual_aggregate_all_vm_memory_on_disk
    {:label => _("Memory on Disk"),
     :value => number_to_human_size(@record.aggregate_all_vm_memory_on_disk || 0, :precision => 2)}
  end

  def textual_retirement_date
    {:label => _("Retirement Date"),
     :icon  => "fa fa-clock-o",
     :value => (@record.retires_on.nil? ? _("Never") : @record.retires_on.strftime("%x %R %Z"))}
  end

  def textual_retirement_state
    {:label => _("Retirement State"), :value => @record.retirement_state.to_s.capitalize}
  end

  def textual_lifecycle_state
    {:label => _("State"), :value => @record.lifecycle_state ? @record.lifecycle_state.humanize.capitalize : _("None")}
  end

  def textual_catalog_item
    st = @record.service_template
    s = {:label => _("Parent Catalog Item"), :icon => "pficon pficon-template", :value => (st.nil? ? _("None") : st.name)}
    if st && role_allows?(:feature => "catalog_items_accord")
      s[:title] = _("Show this Service's Parent Service Catalog")
      s[:link]  = url_for_only_path(:controller => 'catalog', :action => 'show', :id => st)
    end
    s
  end

  def textual_parent_service
    parent = @record.parent_service
    if parent
      {
        :label => _("Parent Service"),
        :image => parent.picture ? "/pictures/#{parent.picture.basename}" : nil,
        :icon  => parent.picture ? nil : "pficon pficon-service",
        :value => parent.name,
        :title => _("Show this Service's Parent Service"),
        :link  => url_for_only_path(:controller => 'service', :action => 'show', :id => parent)
      }
    end
  end

  def textual_orchestration_stack
    ost = @record.try(:orchestration_stack)
    if ost && ost.id.blank?
      {:label => _("Orchestration Stack"),
       :icon  => 'ff ff-stack',
       :value => ost.name,
       :title => _("Invalid Stack")}
    elsif ost
      ost
    end
  end

  def textual_job
    job = @record.try(:job)
    if job
      {
        :label => _("Job"),
        :icon  => "ff ff-stack",
        :value => job.name,
        :title => _("Show this Service's Job"),
        :link  => url_for_only_path(:controller => 'configuration_job', :action => 'show', :id => job.id)
      }
    end
  end

  def textual_owner
    {:label => _('Owner'), :value => @record.evm_owner.try(:name)}
  end

  def textual_group
    {:label => _('Group'), :value => @record.miq_group.try(:description)}
  end

  def textual_created
    {:label => _("Created On"), :value => format_timezone(@record.created_at)}
  end

  def textual_miq_custom_attributes
    attrs = @record.miq_custom_attributes
    return nil if attrs.blank?
    attrs.sort_by(&:name).collect { |a| {:label => a.name, :value => a.value} }
  end

  def textual_status
    {:label => _("Status"), :value => @job.status}
  end

  def textual_start_time
    {:label => _("Started"), :value => format_timezone(@job.start_time)}
  end

  def textual_finish_time
    {:label => _("Finished"), :value => format_timezone(@job.finish_time)}
  end

  def textual_elapsed_time
    {:label => _("Elapsed"), :value => @job.finish_time && @job.start_time ? calculate_elapsed_time(@job.start_time, @job.finish_time) : "N/A"}
  end

  def textual_playbook
    return nil unless @job.playbook
    {:label => _("Playbook"), :value => @job.playbook.name}
  end

  def textual_repository
    return nil unless @job.playbook
    {:label => _("Repository"), :value => @job.playbook.configuration_script_source.name}
  end

  def textual_verbosity
    {:label => _("Verbosity"), :value => @job.verbosity}
  end

  def textual_hosts
    {:label => _("Hosts"), :value => @job.hosts.join(", ")}
  end

  def textual_machine_credential
    credential = @job.authentications.find_by(:type => 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential')
    return nil unless credential
    credential(credential, _("Machine"))
  end

  def textual_vault_credential
    credential = @job.authentications.find_by(:type => 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential')
    return nil unless credential
    credential(credential, _("Vault"))
  end

  def textual_network_credential
    credential = @job.authentications.find_by(:type => 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential')
    return nil unless credential
    credential(credential, _("Network"))
  end

  def textual_cloud_credential
    cloud_credential = nil
    excluded_types = ["ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential",
                      "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential",
                      "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential"]
    @job.authentications.each do |authentication|
      cloud_credential = authentication unless excluded_types.include?(authentication.type)
    end
    return nil unless cloud_credential
    credential(cloud_credential, _("Cloud"))
  end

  def textual_generic_object_instances
    num = @record.number_of(:generic_objects)
    h = {:label => _("Instances"), :value => num}
    if role_allows?(:feature => "generic_object_view") && num.positive?
      h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => 'generic_objects', :type => 'tile'),
               :title => _('Show Generic Object Instances for this Service'))
    end
    h
  end

  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    {
      :label => _('Custom Button Events'),
      :value => num = @record.number_of(:custom_button_events),
      :link  => num.positive? ? url_for_only_path(:action => 'show', :id => @record, :display => 'custom_button_events') : nil,
      :icon  => CustomButtonEvent.decorate.fonticon,
    }
  end

  def credential(credential, label)
    {:label => label,
     :value => credential.name,
     :title => ui_lookup(:model => credential.type),
     :link  => url_for_only_path(:action => 'show', :id => credential.id, :controller => 'ansible_credential')}
  end

  def provisioning_get_job
    fetch_job("Provision")
  end

  def retirement_get_job
    fetch_job("Retirement")
  end

  def fetch_job(type = nil)
    @job = @record.try(:job, type)
  end

  def fetch_job_plays
    items = @job.job_plays.sort_by(&:start_time).collect do |play|
      [play.name,
       format_timezone(play.start_time),
       format_timezone(play.finish_time),
       play.finish_time && play.start_time ? calculate_elapsed_time(play.start_time, play.finish_time) : '/A']
    end.sort

    TextualTable.new(
      _("Plays"),
      items,
      [_("Name"), _("Started"), _("Finished"), _("Elapsed")]
    )
  end

  def calculate_elapsed_time(stime, ftime)
    val = (ftime - stime)
    hours = val / 3600
    mins = (val / 60) % 60
    secs = val % 60
    ("%02d:%02d:%02d" % [hours, mins, secs])
  end
end
