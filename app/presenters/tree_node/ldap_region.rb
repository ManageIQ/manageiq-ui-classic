module TreeNode
  class LdapRegion < Node
    set_attribute(:text) { _("Region: %{region_name}") % {:region_name => @object.name} }
    set_attribute(:tooltip) { _("LDAP Region: %{ldap_region_name}") % {:ldap_region_name => @object.name} }
  end
end
