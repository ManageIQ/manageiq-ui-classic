class ContainerReplicatorDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-replicator'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
