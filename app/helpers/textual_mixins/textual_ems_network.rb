module TextualMixins::TextualEmsNetwork
  def textual_ems_network
    textual_link(@record.ext_management_system, :label => _('Network Manager'))
  end
end
