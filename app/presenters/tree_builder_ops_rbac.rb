class TreeBuilderOpsRbac < TreeBuilder
  has_kids_for Tenant, [:x_get_tree_tenant_kids]

  private

  def tree_init_options
    {:open_all => false, :lazy => true}
  end

  def root_options
    region = MiqRegion.my_region
    text = _("%{product} Region: %{region_description} [%{region}]") % {:region_description => region.description,
                                                                        :region             => region.region,
                                                                        :product            => Vmdb::Appliance.PRODUCT_NAME}
    {
      :text    => text,
      :tooltip => text,
      :icon    => 'pficon pficon-regions'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(_count_only)
    objects = []
    if ApplicationHelper.role_allows?(:feature => "rbac_user_view", :any => true)
      objects.push(:id => "u", :text => _("Users"), :icon => "pficon pficon-user", :tip => _("Users"))
    end
    if ApplicationHelper.role_allows?(:feature => "rbac_group_view", :any => true)
      objects.push(:id => "g", :text => _("Groups"), :icon => "ff ff-group", :tip => _("Groups"))
    end
    if ApplicationHelper.role_allows?(:feature => "rbac_role_view", :any => true)
      objects.push(:id => "ur", :text => _("Roles"), :icon => "ff ff-user-role", :tip => _("Roles"))
    end
    if ApplicationHelper.role_allows?(:feature => "rbac_tenant_view")
      objects.push(:id => "tn", :text => _("Tenants"), :icon => "pficon pficon-tenant", :tip => _("Tenants"))
    end
    objects
  end

  def x_get_tree_custom_kids(object_hash, count_only, _options)
    objects =
      case object_hash[:id]
      when "u"  then Rbac.filtered(User.in_my_region)
      when "g"  then Rbac.filtered(MiqGroup.non_tenant_groups_in_my_region)
      when "ur" then Rbac.filtered(MiqUserRole)
      when "tn" then Tenant.with_current_tenant
      end
    count_only_or_objects(count_only, objects, "name")
  end

  def x_get_tree_tenant_kids(object, count_only)
    count_only_or_objects(count_only, object.children, "name")
  end
end
