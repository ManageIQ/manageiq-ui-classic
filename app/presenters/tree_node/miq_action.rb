module TreeNode
  class MiqAction < Node
    set_attribute(:text, &:description)
    set_attribute(:icon) do
      if @tree.instance_of?(TreeBuilderAction)
        @object.decorate.fonticon
      else
        flag_of(@object) == :success ? "pficon pficon-ok" : "pficon pficon-error-circle-o"
      end
    end

    private

    def flag_of(object)
      object.instance_variable_get(:@flag)
    end
  end
end
