class GraphQLExplorerController < ApplicationController
  before_action :check_privileges

  after_action :cleanup_action

  menu_section :graphql_explorer

  def index
    @in_a_form = true
    @layout = "graphql_explorer"
  end
end
