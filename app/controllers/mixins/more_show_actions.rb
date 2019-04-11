module Mixins
  module MoreShowActions
    def show_timeline
      @showtype = "timeline"
      @layout = 'timeline'
      session[:tl_record_id] = params[:id] if params[:id]
      @lastaction = "show_timeline"
      @timeline = @timeline_filter = true
      tl_build_timeline # Create the timeline report
    end

    def show_performance
      @showtype = "performance"
      display_name = @record.respond_to?(:evm_display_name) ? @record.evm_display_name : @record.name
      perf_gen_init_options # Initialize options, charts are generated async
    end

    def show_compliance_history
      count = params[:count] ? params[:count].to_i : 10
      update_session_for_compliance_history(count)
      @showtype = @display
    end

    def show_topology
      @showtype = "topology"
    end

    def update_session_for_compliance_history(count)
      @ch_tree = TreeBuilderComplianceHistory.new(:ch_tree, :ch, @sb, true, :root => @record)
      session[:ch_tree] = @ch_tree.tree_nodes
      session[:tree_name] = "ch_tree"
      session[:squash_open] = (count == 1)
    end
  end
end
