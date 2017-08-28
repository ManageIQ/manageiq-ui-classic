class GenericObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :automate

  def self.model
    GenericObject
  end

  def self.populate_display_methods(record)
    define_singleton_method("display_methods") do
      associations = %w()
      record.property_associations.each do |key, _value|
        associations.push(key)
      end
      associations
    end
  end

  private

  def textual_group_list
    [%i(properties attribute_details_list associations)]
  end

  helper_method :textual_group_list
end
