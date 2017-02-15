module ApplicationHelper::ImportExportHelper
  def status_icon_image_path(exists)
    icon_name = exists ? "checkmark" : "equal-green"
    image_path("16/#{icon_name}.png")
  end

  def status_description(exists)
    exists ? _("This object already exists in the database with the same name") : _("New object")
  end
end
