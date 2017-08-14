class ApplicationHelper::Button::TransformVmButton < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.vendor == "vmware"
  end

  def disabled?
    # Is there a provider that supports import?
    EmsInfra.all.select(&:validate_import_vm).empty?
  end
end
