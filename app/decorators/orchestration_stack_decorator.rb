class OrchestrationStackDecorator < MiqDecorator
  def self.fonticon
    'ff ff-stack'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
