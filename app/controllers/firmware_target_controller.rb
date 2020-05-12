class FirmwareTargetController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[firmware_binaries]
  end

  def self.model
    FirmwareTarget
  end

  def display_firmware_binaries
    nested_list(FirmwareBinary, :breadcrumb_title => _('Firmware Binaries'))
  end

  private

  def textual_group_list
    [%i[properties relationships]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _('Cloud')},
        {:title => _('Infrastructure')},
        {
          :title => _('Firmware Registries'),
          :url   => url_for(:controller => :firmware_registry, :action => :show_list)
        },
        {:title => _('Firmware Targets'), :url => controller_url},
      ],
    }
  end
end
