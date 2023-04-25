module OpsHelper::RoleRbacDetailsHelper
  private

  def role_rbac_details(role, rbac_menu_tree)
    summary = []
    summary.push(rbac_role_info_view(role, rbac_menu_tree))
    summary.push(rbac_groups_using_role_info(role))
    safe_join(summary)
  end

  def groups_using_role(icon, value, style)
    {:cells => {:icon => icon, :value => value, :style => style}}
  end

  def rbac_role_info_view(role, rbac_menu_tree)
    rows = [
      row_data(_('ID'), role.id),
      row_data(_('Name'), role.name),
      row_data(_("Access Restriction for Catalog Items, Orchestration Stacks, Key Pairs, Services, VMs, and Templates"), role.settings.kind_of?(Hash) && role.settings.fetch_path(:restrictions, :vms) ? _(MiqUserRole::RESTRICTIONS[role.settings.fetch_path(:restrictions, :vms)]) : _("None")),
      row_data(_("Product Features (Read Only)"), {:input => 'component', :component => 'TREE_VIEW_REDUX', :props => rbac_menu_tree.locals_for_render, :name => rbac_menu_tree.name})
    ]
    miq_structured_list({
                          :title => _("Role Information"),
                          :rows  => rows
                        })
  end

  def rbac_groups_using_role_info(role)
    rows = []
    role.miq_groups.sort_by { |a| a.description.downcase }.each do |group|
      row = groups_using_role("i ff ff-group", group.description, "display_flex cursor_pointer")
      row[:cells][:link] = if role_allows?(:feature => "rbac_group_show")
                             ["#",
                              row[:cells][:onclick] = "miqOnClickSelectRbacTreeNode('g-#{group.id}');",
                              row[:cells][:title] = _("View this Group")]
                           else
                             "#"
                           end
      rows.push(row)
    end
    miq_structured_list({
                          :title => _("Groups Using this Role"),
                          :rows  => rows
                        })
  end
end
