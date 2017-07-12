class ApplicationHelper::Button::TransformVmButton < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    false
  end

  def disabled?
    # Is there a provider that supports import?
    EmsInfra.all.select(&:validate_import_vm).empty?
  end
end
