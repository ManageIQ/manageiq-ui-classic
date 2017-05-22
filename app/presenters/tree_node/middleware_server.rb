module TreeNode
  class MiddlewareServer < Node
    set_attribute(:title) { [@object.name.presence, @object.hostname].join(" - ") }
  end
end
