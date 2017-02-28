module TreeNode
  class LdapDomain < Node
    set_attribute(:title) { _("Domain: %{domain_name}") % {:domain_name => @object.name} }
    set_attribute(:icon) { @object.decorate.fonticon }
    set_attribute(:tooltip) { _("LDAP Domain: %{ldap_domain_name}") % {:ldap_domain_name => @object.name} }
  end
end
