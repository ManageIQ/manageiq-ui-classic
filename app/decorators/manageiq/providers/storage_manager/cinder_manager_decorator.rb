module ManageIQ::Providers::StorageManager
  class CinderManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openstack.svg"
    end
  end
end
