class GenericObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  before_action :create_display_methods, only: [:show]

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

  def create_display_methods
    key = params[:display] || params[:model]
    define_singleton_method("display_#{key}") do
      nested_list(key, @record.generic_object_definition.properties[:associations][key], generate_options(key))
    end
  end

  def generate_options(key)
    {:breadcrumb_title => _("#{key.upcase}"), :association => key}
  end

  private

  def textual_group_list
    [%i(properties attribute_details_list associations)]
  end

  helper_method :textual_group_list
end
