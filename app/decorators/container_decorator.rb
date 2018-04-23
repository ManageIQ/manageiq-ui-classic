class ContainerDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cube'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
