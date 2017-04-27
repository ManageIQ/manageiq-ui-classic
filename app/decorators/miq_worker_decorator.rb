class MiqWorkerDecorator < MiqDecorator
  def listicon_image
    "100/processmanager-#{normalized_type}.png"
  end
end
