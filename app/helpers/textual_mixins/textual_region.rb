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

  def textual_region_with_button_link
    return nil if @record.region_number == MiqRegion.my_region_number

    url = @record.miq_region.remote_ui_url
    h = {:label => _('Remote Region'), :value => _('Connect to VM in its Region')}
    if url
      h[:link] = url_for(:host => url, :action => 'show', :id => @record)
      h[:title] = _('Connect to VM in its Region')
      h[:external] = true
      h[:button] = true
    end
    h
  end
end
