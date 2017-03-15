class MiqWorkerDecorator < MiqDecorator
  def self.listicon_image
    "100/processmanager-#{normalized_type}.png" if defined? normalized_type
  end
end
