module TextualMixins::TextualRegion
  def textual_region
    return nil if @record.region_number == MiqRegion.my_region_number
    h = {:label => _("Region")}
    reg = @record.miq_region
    url = reg.remote_ui_url
    h[:value] = reg.description
    if url
      # this must be url_for to make sure :host is used
      h[:link] = url_for(:host   => url,
                         :action => 'show',
                         :id     => @record)
      h[:title] = _("Connect to this VM in its Region")
      h[:external] = true
    end
    h
  end
end
