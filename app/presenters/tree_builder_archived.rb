module TreeBuilderArchived
  def x_get_tree_custom_kids(object, count_only, options)
    klass = options[:leaf].safe_constantize
    objects = if TreeBuilder.hide_vms
                [] # hidden all VMs
              else
                case object[:id]
                when "orph" then  klass.orphaned
                when "arch" then  klass.archived
                end
              end
    count_only_or_objects_filtered(count_only, objects, "name")
  end

  def x_get_tree_arch_orph_nodes(model_name)
    archived = QuadiconHelper.machine_state('archived').values_at(:fonticon, :background)
    orphaned = QuadiconHelper.machine_state('orphaned').values_at(:fonticon, :background)

    [
      {:id => "arch", :text => _("<Archived>"), :icon => archived[0], :icon_background => archived[1], :tip => _("Archived %{model}") % {:model => model_name}},
      {:id => "orph", :text => _("<Orphaned>"), :icon => orphaned[0], :icon_background => orphaned[1], :tip => _("Orphaned %{model}") % {:model => model_name}}
    ]
  end
end
