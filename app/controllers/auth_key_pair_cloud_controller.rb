class AuthKeyPairCloudController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::CheckedIdMixin
  include Mixins::Actions::VmActions::Ownership

  def self.display_methods
    %w[instances]
  end

  def show_list
    assert_privileges("auth_key_pair_cloud_show_list")

    process_show_list(:dbname => :authkeypaircloud, :gtl_dbname => :authkeypaircloud)
  end

  def breadcrumb_name(_model)
    _("Key Pairs")
  end

  def self.table_name
    @table_name ||= "auth_key_pair_cloud"
  end

  def self.model
    ManageIQ::Providers::CloudManager::AuthKeyPair
  end

  def specific_buttons(pressed)
    case pressed
    when 'auth_key_pair_cloud_new'
      javascript_redirect(:action => 'new')
      true
    when 'auth_key_pair_ownership'
      @ownershipitems = find_records_with_rbac(ManageIQ::Providers::CloudManager::AuthKeyPair, checked_or_params)
      javascript_redirect(:action => 'ownership', :rec_ids => @ownershipitems.map(&:id))
      true
    end
  end

  def download_private_key
    assert_privileges("auth_key_pair_cloud_download")
    disable_client_cache
    @key_pair = find_record_with_rbac(ManageIQ::Providers::CloudManager::AuthKeyPair, params[:id])
    filename = @key_pair.fingerprint.delete(':', '')
    send_data(@key_pair.auth_key, :filename => "#{filename}.key")
  end

  def new
    assert_privileges("auth_key_pair_cloud_new")
    @in_a_form = true
    drop_breadcrumb(:name => _("Add New Key Pair"), :url => "/auth_key_pair_cloud/new")
  end
  
  private

  def textual_group_list
    [%i[properties relationships lifecycle], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Key Pairs"), :url => controller_url},
      ],
    }
  end

  menu_section :clo
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
