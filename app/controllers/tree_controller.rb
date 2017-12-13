# This is a highly experimental implementation of something that we would like to have probably in an UI-API
# It is definitely not a good example and it SHOULD NOT BE COPY-PASTED in any case
class TreeController < ApplicationController
  skip_after_action :set_global_session_data
  before_action :check_privileges

  def automate_entrypoint
    json = fetch_tree(TreeBuilderAutomateEntrypoint, :automate_entrypoint, params[:id])
    render :body => json, :content_type => 'application/json'
  end

  def automate_inline_methods
    json = fetch_tree(TreeBuilderAutomateInlineMethod, :automate_inline_method, params[:id])
    render :body => json, :content_type => 'application/json'
  end

  private

  def fetch_tree(klass, name, node_id = nil)
    tree = klass.new(name, "#{name}_tree".to_sym, {})

    if node_id
      TreeBuilder.convert_bs_tree(tree.x_get_child_nodes(node_id)).to_json
    else
      tree.instance_variable_get(:@bs_tree)
    end
  end
end
