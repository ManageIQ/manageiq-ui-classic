class ConfigurationScriptSourceDecorator < Draper::Decorator
  delegate_all

  def fonticon
    "pficon pficon-repository"
  end

  def listicon_image
    nil
  end
end
