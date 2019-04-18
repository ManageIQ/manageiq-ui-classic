module MiqAeToolsHelper
  def git_import_button_enabled?
    GitBasedDomainImportService.available?
  end
end
