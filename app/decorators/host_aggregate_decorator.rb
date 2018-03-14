class HostAggregateDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-screen'
  end

  def single_quad
    {
      :fileicon => '100/host_aggregate.png'
    }
  end
end
