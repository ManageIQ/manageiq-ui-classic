class FirmwareRegistryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::ListnavMixin
  include Mixins::BreadcrumbsMixin

  menu_section :phy
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

  def download_data
    assert_privileges('firmware_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('firmware_show')
    super
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
        {:title => _('Physical Infrastructure')},
        {:title => _('Firmware Registries'), :url => controller_url},
      ],
    }
  end
end
