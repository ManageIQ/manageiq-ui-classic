class TreeBuilderServersByRole < TreeBuilderDiagnostics
  has_kids_for ServerRole, [:x_get_tree_server_role_kids]

  private

  def x_get_tree_roots
    x_get_tree_server_roles
  end

  def override(node, _object)
    if @sb[:diag_selected_id] && node.key == "role-#{@sb[:diag_selected_id]}"
      node.selected = true
    end
  end

  def x_get_tree_server_roles
    ServerRole.all.sort_by(&:description).each_with_object([]) do |r, objects|
      next if @root.kind_of?(MiqRegion) && !r.regional_role? # Only regional roles under Region
      next if r.name == "database_owner"
      unless @sb[:diag_selected_id] # Set default selected record vars
        @sb[:diag_selected_model] = r.class.to_s
        @sb[:diag_selected_id] = r.id
      end
      objects.push(r)
    end
  end

  def x_get_tree_server_role_kids(parent, _count_only)
    parent.assigned_server_roles.sort_by { |asr| asr.miq_server.name }.select do |asr|
      !@root.kind_of?(Zone) || asr.miq_server.my_zone == @root.name
    end
  end
end
