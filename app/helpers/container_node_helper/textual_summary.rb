module ContainerNodeHelper::TextualSummary
  #
  # Groups
  #
  include TextualMixins::TextualCustomButtonEvents

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name creation_timestamp resource_version num_cpu_cores memory
        max_container_groups identity_system identity_machine identity_infra container_runtime_version
        kubernetes_kubelet_version kubernetes_proxy_version os_distribution kernel_version
      ]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems container_routes container_services container_replicators container_groups containers
        lives_on container_images custom_button_events
      ]
    )
  end

  def textual_group_conditions
    TextualMultilabel.new(
      _("Conditions"),
      :additional_table_class => "table-fixed",
      :labels                 => [_("Name"), _("Status"), _("Last Transition Time"), _("Reason")],
      :values                 => @record.container_conditions.collect do |condition|
        [
          condition.name,
          condition.status,
          (condition.last_transition_time || ""),
          (condition.reason || "")
        ]
      end
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  #
  # Items
  #

  def textual_num_cpu_cores
    {:label => _("Number of CPU Cores"), :icon => "pficon pficon-cpu",
     :value => @record.hardware.nil? ? _("N/A") : @record.hardware.cpu_total_cores}
  end

  def textual_memory
    memory = if @record.try(:hardware).try(:memory_mb)
               number_to_human_size(@record.hardware.memory_mb * 1.megabyte, :precision => 0)
             else
               _("N/A")
             end
    {:label => _("Memory"), :icon => "pficon pficon-memory", :value => memory}
  end

  def textual_max_container_groups
    {:label => _("Max Pods Capacity"), :icon => "fa fa-cubes",
     :value => @record.max_container_groups.nil? ? _("N/A") : @record.max_container_groups}
  end

  def textual_identity_system
    {:label => _("System BIOS UUID"),
     :value => @record.identity_system.nil? ? _("N/A") : @record.identity_system}
  end

  def textual_identity_machine
    {:label => _("Machine ID"),
     :value => @record.identity_machine.nil? ? _("N/A") : @record.identity_machine}
  end

  def textual_identity_infra
    {:label => _("Infrastructure Machine ID"), :value =>
      @record.identity_infra.nil? ? _("N/A") : @record.identity_infra}
  end

  def textual_lives_on
    lives_on_ems = @record.lives_on.try(:ext_management_system)
    return nil if lives_on_ems.nil?

    # TODO: handle the case where the node is a bare-metal
    lives_on_entity_name = lives_on_ems.kind_of?(EmsCloud) ? _("Instance") : _("Virtual Machine")
    {
      :label => _("Underlying %{name}") % {:name => lives_on_entity_name},
      :image => lives_on_ems.decorate.fileicon,
      :value => @record.lives_on.name.to_s,
      :link  => url_for_only_path(
        :action     => 'show',
        :controller => 'vm_or_template',
        :id         => @record.lives_on.id
      )
    }
  end

  def textual_container_runtime_version
    @record.container_runtime_version || _("N/A")
  end

  def textual_kubernetes_kubelet_version
    @record.kubernetes_kubelet_version || _("N/A")
  end

  def textual_kubernetes_proxy_version
    @record.kubernetes_proxy_version || _("N/A")
  end

  def textual_os_distribution
    distribution = if @record.computer_system.nil? || @record.computer_system.operating_system.nil?
                     _("N/A")
                   else
                     @record.computer_system.operating_system.distribution
                   end
    {:label => _("Operating System Distribution"), :value => distribution}
  end

  def textual_kernel_version
    @record.computer_system.try(:operating_system).try(:kernel_version) || _("N/A")
  end

  def textual_compliance_history
    super(:title => _("Show Compliance History of this Node (Last 10 Checks)"))
  end
end
