module TreeNode
  module REXML
    class Element < ::TreeNode::Node
      include MiqAeClassHelper

      set_attribute(:selectable, false)

      set_attributes(:text, :tooltip, :image, :icon) do
        if @object.name == "MiqAeObject"
          text = tooltip = "#{@object.attributes["namespace"]} / #{@object.attributes["class"]} / #{@object.attributes["instance"]}"
          image = 'svg/vendor-redhat.svg'
        elsif @object.name == "MiqAeAttribute"
          text = tooltip = @object.attributes["name"]
          icon = 'ff ff-attribute'
        elsif @object.name.starts_with?('MiqAeService')
          base_obj = @object.name.sub(/^MiqAeService/, '').gsub('_', '::').safe_constantize

          text = tooltip = @object.name
          image = base_obj.try(:decorate).try(:fileicon)

          icon = case base_obj.to_s
                 when 'CloudResourceQuota'
                   'fa fa-pie-chart'
                 when 'MiqRequest'
                   'fa fa-question'
                 when 'Network'
                   'pficon pficon-network'
                 else
                   base_obj.try(:decorate).try(:fonticon)
                 end

        else
          text = tooltip = @object.text.presence || @object.name
          icon = ae_field_fonticon(@object.name.underscore)
        end

        [text, tooltip, image, icon]
      end
    end
  end
end
