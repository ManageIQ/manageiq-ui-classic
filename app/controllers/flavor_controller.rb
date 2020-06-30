class FlavorController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::EmsCommon
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[instances]
  end

  def new
    assert_privileges('flavor_create')
    drop_breadcrumb(:name => _("Add a new Flavor"), :url => "/flavor/new")
    @in_a_form = true
    @id = 'new'
  end

  def ems_list
    assert_privileges('flavor_create')
    ems_list = Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager).select do |ems|
      ems.class::Flavor.supports?(:create) if ems.class.constants.include?(:Flavor)
    end
    ems_list.each do |ems|
      {:name => ems.name, :id => ems.id}
    end
    render :json => {:ems_list => ems_list}
  end

  def cloud_tenants
    assert_privileges('flavor_create')
    cloud_tenants = Rbac::Filterer.filtered(CloudTenant)
    render :json => {:cloud_tenants => cloud_tenants}
  end

  def download_data
    assert_privileges('flavor_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('flavor_show')
    super
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def delete_flavors
    super
    session[:flash_msgs] = @flash_array
    javascript_redirect(:action => 'show_list')
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Flavors"), :url => controller_url},
      ],
      :record_info => @flavor,
    }.compact
  end

  menu_section :clo
end
