module TreeNode
  class AvailabilityZone < Node
    set_attribute(:tooltip) { |object| _("Availability Zone: %{name}") % {:name => object.name} }
  end
end
