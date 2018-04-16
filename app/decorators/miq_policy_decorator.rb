class MiqPolicyDecorator < MiqDecorator
  def fonticon
    icon = case towhat
           when 'Host'
             'pficon pficon-container-node'
           when 'Vm'
             'pficon pficon-virtual-machine'
           when 'ContainerReplicator'
             'pficon pficon-replicator'
           when 'ContainerGroup'
             'fa fa-cubes'
           when 'ContainerNode'
             'pficon pficon-container-node'
           when 'ContainerProject'
             'pficon pficon-project'
           when 'ContainerImage'
             'pficon pficon-image'
           when 'ExtManagementSystem'
             'pficon pficon-server'
           when 'PhysicalServer'
             'pficon pficon-enterprise'
           end
    "#{icon}#{active ? '' : ' fa-inactive'}"
  end
end
