class ContainerProjectDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-project'
  end

  def self.fileicon
    '100/container_project.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
