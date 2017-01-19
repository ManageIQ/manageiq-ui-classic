class AuthPrivateKeyDecorator < Draper::Decorator
  delegate_all

  def fonticon
    nil
  end

  def listicon_image
    "100/auth_key_pair.png"
  end
end
