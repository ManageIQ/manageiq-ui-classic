class ApplicationHelper::Toolbar::Basic < ApplicationHelper::Toolbar::Base
  def definition(record = nil)
    extension_classes_filtered(record).reduce(@definition) do |acc, ext|
      acc.merge(ext.definition)
    end
  end

  private

  def extension_classes
    @extension_classes ||= load_extension_classes
  end

  def extension_classes_filtered(record)
    return extension_classes if record.nil?

    # Example:
    # "ManageIQ::Providers::Amazon::ToolbarOverrides::EmsCloudCenter" is a match for
    #   "ManageIQ::Providers::Amazon::CloudManager
    extension_classes.find_all do |ext|
      ext.name.split('::')[0..2] == record.class.name.split('::')[0..2]
    end
  end

  def load_extension_classes
    return [] if self.class.name.nil?

    toolbar_base_name = self.class.name.to_s.split('::').last
    Vmdb::Plugins.collect do |plugin|
      instance = [plugin.name.chomp('::Engine'), 'ToolbarOverrides', toolbar_base_name].join('::')
      instance.safe_constantize
    end.compact
  end
end
