module TreeNode
  class MiqAeNode < Node
    set_attribute(:tooltip) { "#{ui_lookup(:model => model)}: #{text}" }

    def text
      @object.display_name.blank? ? @object.name : "#{@object.display_name} (#{@object.name})"
    end

    private

    def model
      @object.class.to_s
    end
  end
end
