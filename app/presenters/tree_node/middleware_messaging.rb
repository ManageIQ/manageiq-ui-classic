module TreeNode
  class MiddlewareMessaging < Node
    set_attribute(:text) { [@object.middleware_server.name.presence, @object.name.presence].join(" - ") }
  end
end
