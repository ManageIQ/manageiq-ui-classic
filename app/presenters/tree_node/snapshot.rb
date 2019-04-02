module TreeNode
  class Snapshot < Node
    set_attribute(:tooltip, &:name)
    set_attribute(:text) do
      if @object.current?
        "#{@object.name} (#{_('Active')})"
      else
        @object.name
      end
    end
  end
end
