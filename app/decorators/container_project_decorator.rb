class ContainerProjectDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-project'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
