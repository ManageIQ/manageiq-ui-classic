class MiqPolicyDecorator < Draper::Decorator
  delegate_all

  def fonticon
    icon = case towhat
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
    "#{icon}#{active ? '' : ' fa-inactive'}"
  end
end
