module TreeNode
  class MiddlewareDatasource < Node
    set_attribute(:text) { [@object.middleware_server.name, @object.name].join(" - ") }
  end
end
