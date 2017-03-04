class ApplicationHelper::Button::CustomizationTemplateNew < ApplicationHelper::Button::CustomizationTemplate
  include ApplicationHelper::Button::Mixins::SubListViewScreenMixin

  def visible?
    !sub_list_view_screen? && !system?
  end

  def disabled?
    if @pxe_image_types_count <= 0
      @error_message = _('No System Image Types available, Customization Template cannot be added')
    end
    @error_message.present?
  end
end
