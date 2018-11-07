class TreeBuilderPolicy < TreeBuilder
  has_kids_for MiqPolicy, [:x_get_tree_po_kids]
  has_kids_for MiqEventDefinition, %i[x_get_tree_ev_kids parents]

  private

  def tree_init_options
    {:full_ids => true}
  end

  def compliance_control_kids(mode)
    text_i18n = {:compliance => {:Host                => _("Host Compliance Policies"),
                                 :Vm                  => _("Vm Compliance Policies"),
                                 :ContainerReplicator => _("Replicator Compliance Policies"),
                                 :ContainerGroup      => _("Pod Compliance Policies"),
                                 :ContainerNode       => _("Container Node Compliance Policies"),
                                 :ContainerImage      => _("Container Image Compliance Policies"),
                                 :ContainerProject    => _("Container Project Compliance Policies"),
                                 :ExtManagementSystem => _("Provider Compliance Policies"),
                                 :PhysicalServer      => _("Physical Server Compliance Policies")},
                 :control    => {:Host                => _("Host Control Policies"),
                                 :Vm                  => _("Vm Control Policies"),
                                 :ContainerReplicator => _("Replicator Control Policies"),
                                 :ContainerGroup      => _("Pod Control Policies"),
                                 :ContainerNode       => _("Container Node Control Policies"),
                                 :ContainerImage      => _("Container Image Control Policies"),
                                 :ContainerProject    => _("Container Project Control Policies"),
                                 :ExtManagementSystem => _("Provider Control Policies"),
                                 :PhysicalServer      => _("Physical Server Control Policies")}}

    MiqPolicyController::UI_FOLDERS.collect do |model|
      text = text_i18n[mode.to_sym][model.name.to_sym]
      icon = model.to_s.safe_constantize.try(:decorate).try(:fonticon)
      {
        :id   => "#{mode}-#{model.name.camelize(:lower)}",
        :icon => icon,
        :text => text,
        :tip  => text
      }
    end
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Policies"),
      :tooltip => t
    }
  end

  # level 1 - compliance & control
  def x_get_tree_roots
    objects = []
    objects << {:id => "compliance", :text => _("Compliance Policies"), :icon => "pficon pficon-history", :tip => _("Compliance Policies")}
    objects << {:id => "control", :text => _("Control Policies"), :icon => "fa fa-shield", :tip => _("Control Policies")}

    # Push folder node ids onto open_nodes array
    objects.each { |o| open_node("xx-#{o[:id]}") }

    count_only_or_objects(false, objects)
  end

  # level 2 & 3...
  def x_get_tree_custom_kids(parent, count_only)
    # level 2 - host, vm, etc. under compliance/control
    if %w[compliance control].include?(parent[:id])
      mode = parent[:id]
      objects = compliance_control_kids(mode)

      return count_only_or_objects(count_only, objects)
    end

    # level 3 - actual policies
    mode, resource_type = parent[:id].split('-')
    resource_type = resource_type.camelize
    if MiqPolicyController::UI_FOLDERS.collect(&:name).include?(resource_type)
      objects = MiqPolicy.where(:mode => mode, :resource_type => resource_type)

      return count_only_or_objects(count_only, objects, :description)
    end

    # error checking
    super
  end

  # level 4 - conditions & events for policy
  def x_get_tree_po_kids(parent, count_only)
    conditions = count_only_or_objects(count_only, parent.conditions, :description)
    miq_events = count_only_or_objects(count_only, parent.miq_event_definitions, :description)
    conditions + miq_events
  end

  # level 5 - actions under events
  def x_get_tree_ev_kids(parent, count_only, parents)
    # the policy from level 3
    pol_rec = node_by_tree_id(parents.last)

    success = count_only_or_objects(count_only, pol_rec ? pol_rec.actions_for_event(parent, :success) : [])
    failure = count_only_or_objects(count_only, pol_rec ? pol_rec.actions_for_event(parent, :failure) : [])
    unless count_only
      add_flag_to(success, :success) unless success.empty?
      add_flag_to(failure, :failure) unless failure.empty?
    end
    success + failure
  end

  def add_flag_to(array, flag)
    array.each do |i|
      i.instance_variable_set(:@flag, flag)
    end
  end
end
