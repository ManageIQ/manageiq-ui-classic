module TreeNode
  class MiddlewareServer < Node
    set_attribute(:title) { |object| object.name.presence + '-' + object.host_name }
  end
end
