module TreeNode
  class MiqAction < Node
    set_attribute(:title, &:description)
    set_attribute(:icon) do
      if @options[:tree] != :action_tree
        flag_of(@object) == :success ? "pficon pficon-ok" : "pficon pficon-error-circle-o"
      else
        @object.decorate.fonticon
      end
    end

    private

    def flag_of(object)
      object.instance_variable_get(:@flag)
    end
  end
end
