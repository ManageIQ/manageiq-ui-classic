class ApplicationHelper::Button::MiqAeGitRefresh < ApplicationHelper::Button::MiqAeDomain
  needs :@record

  def disabled?
    false
  end

  def visible?
    super || (git_enabled?(@record) && GitBasedDomainImportService.available?)
  end
end
