module TreeNode
  class AvailabilityZone < Node
    set_attribute(:tooltip) { _("Availability Zone: %{name}") % {:name => @object.name} }
  end
end
