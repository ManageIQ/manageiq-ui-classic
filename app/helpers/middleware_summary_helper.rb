module MiddlewareSummaryHelper
  include TextualMixins::TextualName

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_nativeid
    @record.nativeid
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(tags))
  end

  def textual_middleware_servers
    textual_link(@record.middleware_servers)
  end

  def textual_middleware_server
    textual_link(@record.middleware_server)
  end
end
