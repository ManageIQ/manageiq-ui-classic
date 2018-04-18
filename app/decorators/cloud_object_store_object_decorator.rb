class CloudObjectStoreObjectDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-object-store'
  end

  def self.fileicon
    '100/cloud_object_store_container.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
