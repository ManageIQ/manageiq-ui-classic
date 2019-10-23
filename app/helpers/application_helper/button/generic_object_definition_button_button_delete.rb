class ApplicationHelper::Button::GenericObjectDefinitionButtonButtonDelete < ApplicationHelper::Button::Basic
  needs :@record

  def data(_data)
    {
      'function'      => 'sendDataWithRx',
      'function-data' => {
        :type       => 'delete',
        :controller => 'toolbarActions',
        :payload    => {
          :entity       => "custom_buttons",
          :redirect_url => "/generic_object_definition/",
          :name         => @record.name,
          :labels       => { :single => _("Button") }
        }
      }
    }
  end
end
