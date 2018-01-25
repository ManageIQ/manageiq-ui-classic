class GraphQLController < ApplicationController
  before_action :check_privileges

  after_action :cleanup_action

  menu_section :graphql

  def index
    @in_a_form = true
    @layout = "graphql"
  end
end
