class ApplicationHelper::Toolbar::Basic
  include Singleton
  extend SingleForwardable
  delegate %i(button select twostate separator definition button_group custom_content) => :instance

  attr_reader :definition

  def custom_content(name, args)
    @definition[name] = ApplicationHelper::Toolbar::Custom.new(name, args)
  end

  def button_group(name, buttons)
    @definition[name] = ApplicationHelper::Toolbar::Group.new(name, buttons)
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

  private

  def initialize
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
