class PhysicalRackController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "physical_racks"
  end

  def get_session_data
    @title  = _("Physical Racks")
    @layout = "physical_rack"
    @lastaction = session[:physical_rack_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_rack_lastaction] = @lastaction
  end

  def show_list
    # Disable the cache to prevent a caching problem that occurs when
    # pressing the browser's back arrow button to return to the show_list
    # page while on the Physical Server's show page. Disabling the cache
    # causes the page and its session variables to actually be reloaded.
    disable_client_cache

    process_show_list
  end

  def textual_group_list
    [
      %i[properties relationships],
    ]
  end
  helper_method(:textual_group_list)

  def self.display_methods
    %w[physical_chassis physical_storages physical_servers]
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Racks"), :url => controller_url},
      ],
    }
  end
end
