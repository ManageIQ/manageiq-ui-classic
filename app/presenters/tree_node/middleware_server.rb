module TreeNode
  class MiddlewareServer < Node
    set_attribute(:text) { [@object.name.presence, @object.hostname].join(" - ") }
  end
end
