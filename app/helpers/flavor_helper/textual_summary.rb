module FlavorHelper::TextualSummary
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        cpus cpu_sockets memory enabled publicly_available supports_32_bit supports_64_bit supports_hvm supports_paravirtual
        block_storage_based_only cloud_subnet_required
      ]
    )
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems_cloud instances])
  end

  #
  # Items
  #

  def textual_memory
    {:label => _('Memory'), :value => @record.memory && number_to_human_size(@record.memory, :precision => 1)}
  end

  def textual_cpus
    {:label => _("CPUs"), :value => @record.cpu_total_cores}
  end

  def textual_cpu_sockets
    {:label => _("CPU Sockets"), :value => @record.cpu_sockets}
  end

  def textual_enabled
    {:label => _("Enabled"), :value => @record.enabled}
  end

  def textual_publicly_available
    {:label => _("Public"), :value => @record.publicly_available}
  end

  def textual_supports_32_bit
    return nil if @record.supports_32_bit.nil?

    {:label => _("32 Bit Architecture"), :value => @record.supports_32_bit?}
  end

  def textual_supports_64_bit
    return nil if @record.supports_64_bit.nil?

    {:label => _("64 Bit Architecture"), :value => @record.supports_64_bit?}
  end

  def textual_supports_hvm
    return nil if @record.supports_hvm.nil?

    {:label => _("HVM (Hardware Virtual Machine)"), :value => @record.supports_hvm?}
  end

  def textual_supports_paravirtual
    return nil if @record.supports_paravirtual.nil?

    {:label => _("Paravirtualization"), :value => @record.supports_paravirtual?}
  end

  def textual_block_storage_based_only
    return nil if @record.block_storage_based_only.nil?

    {:label => _("Block Storage Based"), :value => @record.block_storage_based_only?}
  end

  def textual_cloud_subnet_required
    {:label => _('Cloud Subnet Required'), :value => @record.cloud_subnet_required?}
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end
end
