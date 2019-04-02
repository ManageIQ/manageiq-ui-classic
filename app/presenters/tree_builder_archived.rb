module TreeBuilderArchived
  def x_get_tree_arch_orph_nodes(model_name)
    archived = QuadiconHelper.machine_state('archived').values_at(:fonticon, :background)
    orphaned = QuadiconHelper.machine_state('orphaned').values_at(:fonticon, :background)

    [
      {:id => "arch", :text => _("<Archived>"), :icon => archived[0], :icon_background => archived[1], :tip => _("Archived %{model}") % {:model => model_name}},
      {:id => "orph", :text => _("<Orphaned>"), :icon => orphaned[0], :icon_background => orphaned[1], :tip => _("Orphaned %{model}") % {:model => model_name}}
    ]
  end
end
