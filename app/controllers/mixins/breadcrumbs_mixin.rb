module Mixins
  module BreadcrumbsMixin
    def title_for_breadcrumbs
      ActiveSupport::SafeBuffer === @right_cell_text ? @title_for_breadcrumbs : @right_cell_text
    end

    def self.included(controller)
      controller.helper_method(:data_for_breadcrumbs)
      controller.before_action(:x_node_text_from_session)
      controller.after_action(:x_node_text_save_to_session)
    end

    # These actions won't generate additional breadcrumb with their right_cell_text
    PROHIBITED_ACTIONS_TREE = %w[explorer tree_select accordion_select].freeze

    # Save actions buttons
    PROHIBITED_PARAMS_BUTTONS = %w[cancel save add].freeze

    def add_to_breadcrumbs(breadcrumb)
      @tail_breadcrumb = breadcrumb
    end

    # Main method which creates all breadcrumbs and returns them (to view page which will parse them into breadcrumbs nav)
    def data_for_breadcrumbs(controller_options = {})
      options = breadcrumbs_options || {}
      options[:record_info] ||= (@record || {})
      options[:record_title] ||= :name
      options[:not_tree] ||= false
      options[:hide_title] ||= false
      options[:disable_tree] ||= false

      breadcrumbs = options[:breadcrumbs] || []

      # Different methods for controller with explorers and for non-explorers controllers

      if !features? || options[:not_tree]
        # Append breadcrumb from @record item (eg "Openstack") when on some action page (not show, display)
        breadcrumbs.push(build_breadcrumbs_no_explorer(options[:record_info], options[:record_title])) if not_show_page? || options[:include_record]

        # Append tag and policy breadcrumb if they exist
        breadcrumbs.push(special_page_breadcrumb(@tagitems || @politems || @ownershipitems || @retireitems))

        # Append title breadcrumb if they exist and not same as previous breadcrumb (eg "Editing name")
        # Also do not append when user is on show_list page, the menu title is used instead of it
        if @title && !same_as_last_breadcrumb?(breadcrumbs, @title) && !show_list_page? && !options[:hide_title]
          breadcrumbs.push(:title => @title)
        end
      else
        options[:x_node] ||= x_node
        right_cell_text = controller_options[:right_cell_text] || title_for_breadcrumbs

        self.x_node_text = params[:text] if action_name == "tree_select" # get text of the active node

        # Append breadcrumb from title of the accordion (eg "Policies")
        breadcrumbs.push(:title => accord_title, :key => "root") if accord_title

        # On special page (tagitems, politems, etc.)
        if @tagitems || @politems || @ownershipitems || @retireitems
          breadcrumbs.push(special_page_breadcrumb(@tagitems || @politems || @ownershipitems || @retireitems, true, options[:x_node]))
          breadcrumbs.push(:title => right_cell_text)
        else
          # Ancestry parents breadcrumbs (only in services)
          breadcrumbs.concat(ancestry_parents(options[:ancestry], options[:record_info], options[:record_title])) if options[:ancestry]

          # Try to prepare TreeNode on every item outside the root
          if options[:x_node] != 'root'
            if options[:include_record] && options[:record_info].present?
              # Include items (for trees, which does not have final nodes: VMs etc.)
              node = TreeNode.new(options[:record_info])
            else
              # Try to create treenode from the x_node
              model, model_id, _ = TreeBuilder.extract_node_model_and_id(options[:x_node]) if options[:x_node]
              record = model.try(:constantize).try(:find, model_id)

              node = TreeNode.new(record) if record
            end
          end

          # Overrides: if x_root then show title_for_breadcrumbs
          #
          # Priority 1. Include record
          #          2. TreeNode.text
          #          3. Item from tree (if it's built)
          #          4. Fallbacks (sent text, title of the record, title_for_breadcrumbs)
          key = node ? node.key : options[:x_node]
          title = if options[:x_node] == 'root' # After switching accordion, there is no way how to get root text
                    right_cell_text
                  elsif node                    # Use node's text and key
                    node.text
                  elsif @trees.present?         # Select a node when coming from different page (the tree is built)
                    build_breadcrumb_from_tree.try(:[], :title)
                  else                          # Last clicked tree node label
                    @x_node_text.try(:[], x_active_tree)
                  end

          breadcrumbs.push(:title => title, :key => key) if title

          # Append seperate action header breadcrumb when there is some action
          # (User is not on show page)
          # i.e. editing, copying, adding, etc.
          extra_title = right_cell_text || @title
          breadcrumbs.push(:title => extra_title) if action_breadcrumb? && extra_title && title != extra_title
        end

        # disable_tree allows to remove all links from the tree
        if options[:disable_tree]
          filtered_breadcrumbs = breadcrumbs.compact.map { |item| {:title => item[:title]} }

          # replace last clickable breadcrumb with link to explorer
          filtered_breadcrumbs[-2][:to_explorer] = options[:to_explorer] if options[:to_explorer]

          return filtered_breadcrumbs
        end
      end
      breadcrumbs << @tail_breadcrumb
      breadcrumbs.compact
    end

    # append action right_cell_text if actions is not prohibited
    def action_breadcrumb?
      !PROHIBITED_ACTIONS_TREE.include?(action_name) && !PROHIBITED_PARAMS_BUTTONS.include?(params[:button])
    end

    def build_breadcrumbs_no_explorer(record_info, record_title)
      if record_info[record_title]
        breadcrumb_url = url(controller_url, @gtl_url || gtl_url, record_info[:id])
        {:url => breadcrumb_url, :title => record_info[record_title]}
      end
    end

    # TODO: Replace breadcrumb_url with url to right controller (database parameter to controller)
    # and add :url => breadcrumb_url parameter to return hash
    def special_page_breadcrumb(variable, explorer = false, x_node = nil)
      # breadcrumb_url = url(controller_url, notshow, variable.first[:id])
      # EMS has key instead of name
      return if !variable || variable.count != 1

      title = if variable.first[:key]
                variable.first[:key]
              # FloatingIps do not have name
              elsif floating_ip_address?(variable.first)
                variable.first[:address]
              else
                variable.first[:name]
              end
      {:title => title, :key => (explorer ? x_node : nil)}.compact if title
    end

    # Explorer controller methods

    # Get current item from the tree
    def current_tree_item(tree)
      return {:title => tree[:text], :key => tree[:key]} if tree[:key] == x_node

      if tree.include?(:nodes)
        tree[:nodes].each do |node|
          value = current_tree_item(node)
          return value if value
        end
      end
      nil
    end

    def build_breadcrumb_from_tree
      breadcrumb = nil

      @trees.find { |tree| tree.name == x_active_tree }.tree_nodes.each do |subtree|
        value = current_tree_item(subtree)
        breadcrumb = value if value
      end

      breadcrumb
    end

    # Build ancestry parents if user provides an ancestry key
    def ancestry_parents(parent_class, record, title)
      breadcrumbs = []

      while record.try(:ancestry)
        record = parent_class.find(record.ancestry)
        breadcrumbs.push(:title => record[title], :key => TreeBuilder.build_node_id(record))
      end

      breadcrumbs.reverse
    end

    # Helper methods

    def accord_title
      features.find { |f| f.accord_name == x_active_accord.to_s }.try(:title)
    end

    # Has controller features
    def features?
      defined?(features) && features
    end

    # User is not on show page
    def not_show_page?
      (action_name == "show" && params["display"] && !%w[dashboard main].include?(params["display"])) || (action_name != "show")
    end

    # User is on show_list page
    # A lot of pages has different header than last item in menu
    # The last item in menu is an abbreviation of the header
    # So, breadcrumbs should contain only the abbreviation
    def show_list_page?
      action_name == "show_list"
    end

    # Checks if the title is same as the last item in breadcrumbs
    # If so, then there is no reason to append the title to breadcrumbs
    def same_as_last_breadcrumb?(breadcrumbs, title)
      title == breadcrumbs.compact.last.try(:[], :title)
    end

    # Controls on tagging screen if the tagged item is floating_ip
    def floating_ip_address?(variable)
      (variable&.respond_to?(:has_attribute?) && variable&.has_attribute?(:address)) || controller_name == 'floating_ips'
    end

    def controller_url
      url(controller_name)
    end

    def url(*components)
      File.join('/', *components.compact.map(&:to_s))
    end

    def breadcrumbs_options
      {
        :breadcrumbs => [],
      }
    end

    # return correct node to right cell
    def x_node_right_cell
      @sb[@sb[:active_accord]].presence || x_node
    end

    def x_node_text_from_session
      @x_node_text = session[:x_node_text]
    end

    def x_node_text_save_to_session
      session[:x_node_text] = @x_node_text
    end

    def x_node_text=(text)
      @x_node_text ||= {}
      @x_node_text[x_active_tree] = CGI.unescape(text) if text.present?
    end

    def breadcrumbs_menu_section(id = menu_section_id)
      {:title => _(Menu::Manager.section(id)&.name)}
    end
  end
end
