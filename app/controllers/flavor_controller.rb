class FlavorController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

  def self.display_methods
    %w(instances)
  end

  def new
    assert_privileges('flavor_create')
    drop_breadcrumb(:name => _("Add a new Flavor"), :url => "/flavor/new")
    @in_a_form = true
    @id = 'new'
  end

  def button
    case params[:pressed]
    when 'flavor_create' then javascript_redirect(:action => 'new')
    when 'flavor_delete' then delete_flavors
    when 'flavor_tag'    then tag(Flavor)
    end
  end

  def ems_list
    assert_privileges('flavor_create')
    ems_list = Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager).select do |ems|
      ems.class::Flavor.supports?(:create)
    end
    ems_list.each do |ems|
      {:name => ems.name, :id => ems.id}
    end
    render :json => {:ems_list => ems_list}
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def delete_flavors
    assert_privileges('flavor_delete')
    flavors = find_records_with_rbac(Flavor, checked_or_params)
    flavors.each do |flavor|
      begin
        flavor.delete_flavor_queue(User.current_user.id)
        add_flash(_("Delete of Flavor \"%{name}\" was successfully initiated.") % {:name => flavor.name})
      rescue => error
        add_flash(_("Unable to delete Flavor \"%{name}\": %{details}") % {:name    => flavor.name,
                                                                          :details => error.message}, :error)
      end
    end
    session[:flash_msgs] = @flash_array
    javascript_redirect(:action => 'show_list')
  end

  menu_section :clo
end
