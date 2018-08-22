module TextualMixins::TextualCustomButtonEvents
  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin_user?
    # num = CustomButtonEvent.where(:target => @record).length
    num = @record.number_of(:custom_button_events)
    label = _("Custom Button Events")
    h = {:label => label, :icon => "fa fa-list", :value => num}
    if num > 0
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'custom_button_events', :id => @record, :db => controller.controller_name)
    end
    h
  end
end
