module ApplicationHelper::ImportExportHelper
  def status_description(exists)
    exists ? _("This object already exists in the database with the same name") : _("New object")
  end
end
