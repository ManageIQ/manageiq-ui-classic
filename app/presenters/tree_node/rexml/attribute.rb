module TreeNode
  module REXML
    class Attribute < ::TreeNode::Node
      set_attribute(:icon, 'ff ff-attribute')
      set_attribute(:selectable, false)

      set_attributes(:text, :tooltip) do
        t = %i[name value].map { |m| @object.send(m) }.join(' = ')
        [t, t]
      end
    end
  end
end
