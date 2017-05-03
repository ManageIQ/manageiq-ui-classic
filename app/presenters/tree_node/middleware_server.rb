module TreeNode
  class MiddlewareServer < Node
    set_attribute(:title) { [@object.name.presence, @object.host_name].join(" - ") }
  end
end
