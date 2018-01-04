class ApplicationHelper::Button::ButtonNewDiscoverCloud < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::SubListViewScreenMixin

  def visible?
    !sub_list_view_screen?
  end

  def disabled?
    ManageIQ::Providers::CloudManager.subclasses.select(&:supports_discovery?).count.zero?
  end
end
