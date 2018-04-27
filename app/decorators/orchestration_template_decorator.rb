class OrchestrationTemplateDecorator < MiqDecorator
  def self.fonticon
    'ff ff-template'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
