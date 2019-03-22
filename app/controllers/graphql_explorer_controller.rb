class GraphQLExplorerController < ApplicationController
  include Mixins::BreadcrumbsMixin
  before_action :check_privileges

  after_action :cleanup_action

  menu_section :graphql_explorer

  def index
    @in_a_form = true
    @layout = "graphql_explorer"
    @title = _("ManageIQ GraphQL Explorer")
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("GraphQL")},
        {:title => _("Explorer")},
      ],
    }
  end
end
