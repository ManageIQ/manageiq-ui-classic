class OrchestrationStackDecorator < MiqDecorator
  def self.fonticon
    'ff ff-stack'
  end

  def self.fileicon
    "100/orchestration_stack.png"
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
