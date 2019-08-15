module Mixins
  module BreadcrumbsMixin
    def self.included(c)
      c.helper_method(:data_for_breadcrumbs)
    end

    # Main method which creates all breadcrumbs and returns them (to view page which will parse them into breadcrumbs nav)
    def data_for_breadcrumbs
      options = breadcrumbs_options || {}
      options[:record_info] ||= (@record || {})
      options[:record_title] ||= :name
      options[:show_header] ||= false
      options[:not_tree] ||= false
      options[:hide_title] ||= false
      options[:no_magic] ||= false
      breadcrumbs = options[:breadcrumbs] || []

      return breadcrumbs.compact if options[:no_magic]

      # Different methods for controller with explorers and for non-explorers controllers

      if !features? || options[:not_tree]
        # Append breadcrumb from @record item (eg "Openstack") when on some action page (not show, display)
        breadcrumbs.push(build_breadcrumbs_no_explorer(options[:record_info], options[:record_title])) if not_show_page?

        # Append tag and policy breadcrumb if they exist
        breadcrumbs.push(special_page_breadcrumb(@tagitems || @politems || @ownershipitems || @retireitems))

        # Append title breadcrumb if they exist and not same as previous breadcrumb (eg "Editing name")
        if @title && @title != breadcrumbs.compact.last.try(:[], :title) && !options[:hide_title]
          breadcrumbs.push(:title => @title)
        end
      else
        # Append breadcrumb from title of the accordion (eg "Policies")
        breadcrumbs.push(:title => accord_title, :key => "#{accord_name}_accord", :action => "accordion_select") if accord_title

        # Append breadcrumbs created from the tree (eg "All policies > Red Hat policies > Policy 1")
        breadcrumbs_from_tree = build_breadcrumbs_from_tree
        breadcrumbs.concat(breadcrumbs_from_tree)

        if (options[:include_record] || breadcrumbs_from_tree.blank?) && options[:record_info].present? && options[:record_info][options[:record_title]] &&
           !(@tagitems || @politems || @ownershipitems || @retireitems)
          # Append breadcrumb created from record_info if included or if result from tree was empty (eg filters page)

          # Ancestry parents breadcrumbs
          breadcrumbs.concat(ancestry_parents(options[:ancestry], options[:record_info], options[:record_title])) if options[:ancestry]

          breadcrumbs.push(:title => options[:record_info][options[:record_title]], :key => x_node_right_cell)
          breadcrumbs.push(:title => @right_cell_text) if options[:show_header] && @right_cell_text
        else
          # Append breadcrumb from the title of right cell
          breadcrumbs.push(special_page_breadcrumb(@tagitems || @politems || @ownershipitems || @retireitems)) unless options[:hide_special_item]
          breadcrumbs.push(:title => @right_cell_text) if action_breadcrumb?
        end
      end
      breadcrumbs.compact
    end

    def action_breadcrumb?
      @sb["action"] && @right_cell_text
    end

    def build_breadcrumbs_no_explorer(record_info, record_title)
      if record_info[record_title]
        breadcrumb_url = url(controller_url, @gtl_url || gtl_url, record_info[:id])
        {:url => breadcrumb_url, :title => record_info[record_title]}
      end
    end

    # TODO: Replace breadcrumb_url with url to right controller (database parameter to controller)
    # and add :url => breadcrumb_url parameter to return hash
    def special_page_breadcrumb(variable)
      # breadcrumb_url = url(controller_url, notshow, variable.first[:id])
      # EMS has key instead of name
      return if !variable || variable.count != 1

      if variable.first[:key]
        title = variable.first[:key]
      # FloatingIps do not have name
      elsif floating_ip_address?(variable.first)
        title = variable.first[:address]
      else
        title = variable.first[:name]
      end
      {:title => title} if title
    end

    # Explorer controller methods

    # Get breadcrumbs from the current tree path
    def current_tree_path(tree, active_node, path = [])
      result = []
      result.replace(path)
      result.push(:title => tree[:text], :key => tree[:key])

      return result if tree[:key] == active_node

      if tree.include?(:nodes)
        tree[:nodes].each do |node|
          value = current_tree_path(node, active_node, result)
          return value if value
        end
      end
      nil
    end

    def build_breadcrumbs_from_tree
      breadcrumbs = []
      node = x_node
      tree = build_tree if node

      if tree.present?
        tree.tree_nodes.each do |subtree|
          value = current_tree_path(subtree, node)
          breadcrumbs = value if value
        end
      end

      breadcrumbs
    end

    # Build ancestry parents if user provides an ancestry key
    def ancestry_parents(parent_class, record, title)
      breadcrumbs = []

      while record.ancestry
        record = parent_class.find(record.ancestry)
        breadcrumbs.push(:title => record[title], :key => TreeBuilder.build_node_id(record))
      end

      breadcrumbs.reverse
    end

    # Helper methods

    def build_tree
      allowed_features = ApplicationController::Feature.allowed_features(features)
      # allow tree to load whole path to active_node with lazyload nodes (@sb[:trees][x_active_tree][:open_all] = true ?)
      allowed_features.find { |f| f.tree_name == x_active_tree.to_s }.build_tree(@sb.deep_dup)
    end

    def accord_title
      features.find { |f| f.accord_name == x_active_accord.to_s }.try(:title)
    end

    def accord_name
      features.find { |f| f.accord_name == x_active_accord.to_s }.try(:name)
    end

    # Has controller features
    def features?
      defined?(features) && features
    end

    # User is not on show page
    def not_show_page?
      (action_name == "show" && params["display"] && !%w[dashboard main].include?(params["display"])) || (action_name != "show")
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
  end
end
