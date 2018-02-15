class ApplicationHelper::Button::EmsNetwork < ApplicationHelper::Button::Basic
  def visible?
    # Nuage is only provider that supports adding NetworkProvider manually
    # therefore we hide drop-down option completely unless Nuage is enabled.
    return ::Settings.product.nuage unless @record # add new

    @record.supports?(:ems_network_new) # edit
  end
end
