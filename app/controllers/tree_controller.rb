# This is a highly experimental implementation of something that we would like to have probably in an UI-API
# It is definitely not a good example and it SHOULD NOT BE COPY-PASTED in any case
class TreeController < ApplicationController
  before_action :check_privileges

  def automate_entrypoint
    tree = TreeBuilderAutomateEntrypoint.new(:automate_entrypoint, :automate_entrypoint_tree, {})
    json = if params[:id]
             TreeBuilder.convert_bs_tree(tree.x_get_child_nodes(params[:id])).to_json
           else
             tree.instance_variable_get(:@bs_tree)
           end

    render :body => json, :content_type => 'application/json'
  end
end
