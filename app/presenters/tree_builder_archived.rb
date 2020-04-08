module TreeBuilderArchived
  include ApplicationHelper

  def x_get_tree_arch_orph_nodes(model_name)
    archived = QuadiconHelper.machine_state('archived').values_at(:fonticon, :background)
    orphaned = QuadiconHelper.machine_state('orphaned').values_at(:fonticon, :background)
    nodes = []
    arch_node = {:id => "arch", :text => _("<Archived>"), :icon => archived[0], :color => '#fff', :icon_background => archived[1], :tip => _("Archived %{model}") % {:model => model_name}}
    orph_node = {:id => "orph", :text => _("<Orphaned>"), :icon => orphaned[0], :color => '#fff', :icon_background => orphaned[1], :tip => _("Orphaned %{model}") % {:model => model_name}}
    nodes << arch_node if role_allows?(:feature => 'vm_show_list_archived')
    nodes << orph_node if role_allows?(:feature => 'vm_show_list_orphaned')
    nodes
  end
end
