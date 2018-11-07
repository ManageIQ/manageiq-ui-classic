class TreeBuilderCondition < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true}
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Conditions"),
      :tooltip => t
    }
  end

  # not using decorators for now because there are some inconsistencies
  def self.folder_icon(klassname)
    klassname.safe_constantize.try(:decorate).try(:fonticon)
  end

  # level 1 - host / vm
  def x_get_tree_roots
    text_i18n = {:Host                => _("Host Conditions"),
                 :Vm                  => _("VM and Instance Conditions"),
                 :ContainerReplicator => _("Replicator Conditions"),
                 :ContainerGroup      => _("Pod Conditions"),
                 :ContainerNode       => _("Container Node Conditions"),
                 :ContainerImage      => _("Container Image Conditions"),
                 :ContainerProject    => _("Container Project Conditions"),
                 :ExtManagementSystem => _("Provider Conditions"),
                 :PhysicalServer      => _("Physical Infrastructure Conditions")}

    objects = MiqPolicyController::UI_FOLDERS.collect do |model|
      text = text_i18n[model.name.to_sym]
      icon = self.class.folder_icon(model.to_s)

      {
        :id   => model.name.camelize(:lower),
        :icon => icon,
        :text => text,
        :tip  => text
      }
    end
    count_only_or_objects(false, objects)
  end

  # level 2 - conditions
<<<<<<< HEAD
  def x_get_tree_custom_kids(parent, count_only)
    towhat = parent[:id].camelize
    return super unless MiqPolicyController::UI_FOLDERS.collect(&:name).include?(towhat)
=======
  def x_get_tree_custom_kids(parent, count_only, options)
    assert_type(options[:type], :condition)
    resource_type = parent[:id].camelize
    return super unless MiqPolicyController::UI_FOLDERS.collect(&:name).include?(resource_type)
>>>>>>> Rename towhat to resource_type

    objects = Condition.where(:resource_type => resource_type)
    count_only_or_objects(count_only, objects, :description)
  end
end
