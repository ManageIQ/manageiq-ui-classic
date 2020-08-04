class ApplicationHelper::Toolbar::Override < ApplicationHelper::Toolbar::Base
  # the provider toolbar extensions inherit from here

  # prevent overriding existing buttons from toolbar overrides
  def button_group(name, buttons)
    super("#{id_prefix}#{name}", buttons)
  end

  private

  def id_prefix
    self.class.name + "."
  end
end
