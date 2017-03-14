class MiqWorkerDecorator < MiqDecorator
  def self.listicon_image
    "100/processmanager-#{normalized_type}.png"
  end
end
