class TreeBuilderTenants < TreeBuilder
  has_kids_for Tenant, [:x_get_tree_tenant_kids]

  def initialize(name, sandbox, build, **params)
    @additional_tenants = params[:additional_tenants]
    @selectable = params[:selectable]
    @ansible_playbook = params[:ansible_playbook]
    @catalog_bundle = params[:catalog_bundle]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :checkboxes => true,
      :check_url  => "/catalog/#{cat_item_or_bundle}/",
      :open_all   => false,
      :oncheck    => @selectable ? tenant_tree_or_generic : false,
      :post_check => true
    }
  end

  def tenant_tree_or_generic
    if @ansible_playbook
      'miqOnCheckTenantTree'
    else
      'miqOnCheckGeneric'
    end
  end

  def cat_item_or_bundle
    if @catalog_bundle
      'st_form_field_changed'
    else
      'atomic_form_field_changed'
    end
  end

  def root_options
    text = _('All Tenants')
    {
      :text         => text,
      :tooltip      => text,
      :icon         => 'pficon pficon-tenant',
      :hideCheckbox => true
    }
  end

  def x_get_tree_roots(_count_only)
    if ApplicationHelper.role_allows?(:feature => 'rbac_tenant_view')
      Tenant.with_current_tenant
    end
  end

  def x_get_tree_tenant_kids(object, count_only)
    count_only_or_objects(count_only, object.children, 'name')
  end

  def override(node, object)
    node[:state] ||= {}
    node[:state][:checked] = @additional_tenants.try(:include?, object)
    node[:checkable] = @selectable
  end
end
