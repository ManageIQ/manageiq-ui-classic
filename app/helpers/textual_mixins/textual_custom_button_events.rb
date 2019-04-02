module TextualMixins::TextualCustomButtonEvents
  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    link = if controller.restful?
             polymorphic_path(@record, :display => 'custom_button_events')
           else
             url_for_only_path(:action => 'show', :id => @record, :display => 'custom_button_events')
           end

    {
      :label    => _('Custom Button Events'),
      :value    => num = @record.number_of(:custom_button_events),
      :link     => num.positive? ? link : nil,
      :icon     => CustomButtonEvent.decorate.fonticon,
      :explorer => @explorer
    }
  end
end
