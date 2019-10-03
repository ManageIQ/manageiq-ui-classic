class ApplicationHelper::Toolbar::Base
  include Singleton
  extend SingleForwardable
  delegate %i[api_button button select twostate separator definition button_group custom_content] => :instance

  def custom_content(name, props = nil)
    @definition[name] = ApplicationHelper::Toolbar::Custom.new(name, props)
  end

  def button_group(name, buttons)
    @definition[name] = ApplicationHelper::Toolbar::Group.new(name, buttons)
  end

  def api_button(id, icon, title, text, keys = {})
    keys[:data] = {
      'function'      => 'sendDataWithRx',
      'function-data' => {
        'type'       => "generic",
        'controller' => "toolbarActions",
        'payload'    => {
          'entity' => keys[:api][:entity].pluralize,
          'action' => keys[:api][:action]
        }
      }.to_json
    }
    generic_button(:button, id, icon, title, text, keys)
  end

  def button(id, icon, title, text, keys = {})
    generic_button(:button, id, icon, title, text, keys)
  end

  def select(id, icon, title, text, keys = {})
    generic_button(:buttonSelect, id, icon, title, text, keys)
  end

  def twostate(id, icon, title, text, keys = {})
    generic_button(:buttonTwoState, id, icon, title, text, keys)
  end

  def separator
    {:separator => true}
  end

  attr_reader :definition

  private

  def initialize
    @loaded = false
    @definition = {}
  end

  def generic_button(type, id, icon, title, text, keys)
    if text.kind_of?(Hash)
      keys = text
      text = title
    end
    {
      :type  => type,
      :id    => id.to_s,
      :icon  => icon,
      :title => title,
      :text  => text
    }.merge(keys)
  end
end
