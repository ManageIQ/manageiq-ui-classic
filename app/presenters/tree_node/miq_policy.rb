module TreeNode
  class MiqPolicy < Node
    set_attribute(:icon) do
      icon = case @object.towhat
             when 'Host'
               'pficon pficon-screen'
             when 'Vm'
               'pficon pficon-virtual-machine'
             when 'ContainerReplicator'
               'pficon pficon-replicator'
             when 'ContainerGroup'
               'fa fa-cubes'
             when 'ContainerNode'
               'pficon pficon-container-node'
             when 'ContainerImage'
               'pficon pficon-image'
             when 'ExtManagementSystem'
               'pficon pficon-server'
             end
      "#{icon}#{@object.active ? '' : ' fa-inactive'}"
    end
    set_attribute(:title) do
      if @options[:tree] == :policy_profile_tree
        ViewHelper.capture do
          ViewHelper.concat ViewHelper.content_tag(:strong, "#{ui_lookup(:model => @object.towhat)} #{@object.mode.titleize}: ")
          ViewHelper.concat ERB::Util.html_escape(@object.description)
        end
      else
        @object.description
      end
    end
  end
end
