class CloudObjectStoreObjectDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-object-store'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
