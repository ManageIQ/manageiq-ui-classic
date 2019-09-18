module TreeNode
  class MiqAeNode < Node
    set_attribute(:tooltip) { "#{ui_lookup(:model => @object.class.to_s)}: #{text}" }
    set_attribute(:fqname) { @object.try(:fqname) }

    def text
      @object.display_name.blank? ? @object.name : "#{@object.display_name} (#{@object.name})"
    end

    def to_h
      fqname ? super.merge(:fqname => fqname) : super
    end
  end
end
