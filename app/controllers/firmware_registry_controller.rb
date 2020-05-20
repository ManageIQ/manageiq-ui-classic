class FirmwareRegistryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :firmware_registry
  toolbar :firmware_registry

  def self.display_methods
    %w[firmware_binaries]
  end

  def self.model
    FirmwareRegistry
  end

  def title
    _('Firmware Registry')
  end

  def display_firmware_binaries
    nested_list(FirmwareBinary, :breadcrumb_title => _('Firmware Binaries'))
  end

  private

  def textual_group_list
    [
      %i[properties relationships firmware_binaries],
    ]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _('Compute')},
        {:title => _('Infrastructure')},
        {:title => _('Firmware Registries'), :url => controller_url},
      ],
    }
  end
end
