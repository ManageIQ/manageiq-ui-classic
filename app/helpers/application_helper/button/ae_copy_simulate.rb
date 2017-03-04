class ApplicationHelper::Button::AeCopySimulate < ApplicationHelper::Button::ButtonWithoutRbacCheck
  def disabled?
    if @resolve[:button_class].blank?
      @error_message = _('Object attribute must be specified to copy object details for use in a Button')
    end
  end
end
