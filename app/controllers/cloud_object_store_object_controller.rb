class CloudObjectStoreObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def breadcrumb_name(_model)
    _('Cloud Object Store Objects')
  end

  def button
    @edit = session[:edit]
    params[:page] = @current_page unless @current_page.nil?

    process_cloud_object_storage_buttons(params[:pressed])

    delete_action if params[:pressed].ends_with?("delete")
  end

  def title
    _("Cloud Objects")
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Object Storage")},
        {:title => _("Object Store Objects")},
        {:url   => controller_url, :title => _("Cloud Object Store Objects")},
      ],
    }
  end

  menu_section :ost
end
