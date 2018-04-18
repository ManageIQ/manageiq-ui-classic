class ContainerServiceDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-service'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
