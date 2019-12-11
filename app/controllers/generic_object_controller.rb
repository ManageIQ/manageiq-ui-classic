class GenericObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericButtonMixin

  menu_section :automate
  toolbar :generic_object

  def self.model
    GenericObject
  end

  def self.display_methods
    %w[custom_button_events]
  end

  def display_methods(record)
    record.property_associations.keys
  end

  def display_nested_generic(display)
    return unless @record.property_associations.key?(display)

    nested_list(@record.generic_object_definition.properties[:associations][display], :association => display)
  end

  private

  def textual_group_list
    [%i[go_properties attribute_details_list associations methods go_relationships tags]]
  end

  helper_method :textual_group_list
end
