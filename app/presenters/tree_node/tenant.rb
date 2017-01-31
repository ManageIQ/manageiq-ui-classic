module TreeNode
  class Tenant < Node
    set_attribute(:icon) { @object.tenant? ? "pficon pficon-tenant" : "pficon pficon-project" }
  end
end
