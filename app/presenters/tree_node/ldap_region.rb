module TreeNode
  class LdapRegion < Node
    set_attribute(:title) { _("Region: %{region_name}") % {:region_name => @object.name} }
    set_attribute(:icon, 'pficon pficon-regions')
    set_attribute(:tooltip) { _("LDAP Region: %{ldap_region_name}") % {:ldap_region_name => @object.name} }
  end
end
