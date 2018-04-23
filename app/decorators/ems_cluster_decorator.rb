class EmsClusterDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-cluster'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
