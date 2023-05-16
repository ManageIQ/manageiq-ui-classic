class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonGroupDelete < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    !@record.custom_buttons.count.zero?
  end

  def data(_data)
    {
      'function'      => 'sendDataWithRx',
      'function-data' => {
        :type       => 'delete',
        :controller => 'toolbarActions',
        :payload    => {
          :entity       => "custom_button_sets",
          :redirect_url => "/generic_object_definition/",
          :name         => @record.name,
          :labels       => {:single => _("Button Group")}
        }
      }
    }
  end
end
