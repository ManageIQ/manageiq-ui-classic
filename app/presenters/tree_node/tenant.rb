module TreeNode
  class Tenant < Node
    set_attribute(:icon) { "product #{@object.tenant? ? "product-tenant" : "product-project"}" }
  end
end
