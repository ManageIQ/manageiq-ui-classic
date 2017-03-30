module ApplicationHelper::ImportExportHelper
  def status_icon_image_path(exists)
    icon_name = exists ? "100/checkmark.png" : "16/equal-green.png"
    ActionController::Base.helpers.image_path(icon_name)
  end

  def status_description(exists)
    exists ? _("This object already exists in the database with the same name") : _("New object")
  end
end
