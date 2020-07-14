class FirmwareBinaryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::ListnavMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[firmware_targets]
  end

  def self.model
    FirmwareBinary
  end

  def display_firmware_targets
    nested_list(FirmwareTarget, :breadcrumb_title => _('Firmware Targets'))
  end

  def show
    assert_privileges('firmware_show')
    super
  end

  def download_data
    assert_privileges('firmware_show')
    super
  end

  def download_summary_pdf
    assert_privileges('firmware_show')
    super
  end

  private

  def textual_group_list
    [%i[properties relationships firmware_targets]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _('Cloud')},
        {:title => _('Infrastructure')},
        {:title => _('Firmware Registries')},
        {
          :title => @record.firmware_registry.name,
          :url   => url_for(:controller => :firmware_registry, :id => @record.firmware_registry.id, :action => :show)
        },
        {
          :title => _('Firmware Binaries'),
          :url   => url_for(:controller => :firmware_registry, :id => @record.firmware_registry.id, :action => :show,
                            :display => :firmware_binaries)
        },
      ],
    }
  end
end
