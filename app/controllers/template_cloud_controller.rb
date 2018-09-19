class TemplateCloudController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include EmsCommon

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def delete_templates
    assert_privileges('template_delete')
    templates = find_records_with_rbac(TemplateCloud, checked_or_params)

    archived_templates = []
    other_templates = []

    templates.each do |template|
      if template.archived
        archived_templates << template
      else
        other_templates << template
      end
    end

    process_objects(archived_templates.map(&:id), 'destroy', _('Delete')) unless archived_templates.empty?

    other_templates.each do |template|
      begin
        template.delete_image_queue(User.current_user.id)
        add_flash(_("Delete of Template \"%{name}\" was successfully initiated.") % {:name => template.name})
      rescue => error
        add_flash(_("Unable to delete Template \"%{name}\": %{details}") % {:name    => template.name,
                                                                            :details => error.message}, :error)
      end
    end

    session[:flash_msgs] = @flash_array
    javascript_redirect(:action => 'show_list')
  end

  menu_section :clo
end
