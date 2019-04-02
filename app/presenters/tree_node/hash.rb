module TreeNode
  class Hash < Node
    set_attribute(:text) { @object[:text] }

    set_attribute(:image) { @object[:image] }

    set_attribute(:icon) { @object[:icon] }

    set_attribute(:icon_background) { @object[:icon_background] }

    set_attribute(:selectable) { @object.key?(:selectable) ? @object[:selectable] : true }

    set_attribute(:hide_checkbox) { @object.key?(:hideCheckbox) && @object[:hideCheckbox] ? true : nil }

    set_attribute(:selected) { @object.key?(:select) && @object[:select] ? true : nil }

    set_attribute(:klass) { @object.key?(:addClass) ? @object[:addClass] : nil }

    set_attribute(:checkable) { @object[:checkable] != false ? true : nil }

    set_attribute(:tooltip) { @object[:tip] }

    set_attribute(:key) do
      if @object[:id] == "-Unassigned"
        "-Unassigned"
      else
        prefix = TreeBuilder.get_prefix_for_model("Hash")
        "#{@options[:full_ids] && @parent_id.present? ? "#{@parent_id}_" : ''}#{prefix}-#{@object[:id]}"
      end
    end
  end
end
