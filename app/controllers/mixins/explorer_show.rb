module Mixins
  module ExplorerShow
    def send_nested(record, methods)
      obj = record
      Array(methods).each do |method|
        obj = obj.send(method)
      end
      obj
    end

    def show_association(action, display_name, listicon, method, klass, association = nil, conditions = nil)
      params[:display] = klass.name
      # Ajax request means in explorer, or if current explorer is one of the explorer controllers
      @explorer = true if request.xml_http_request? && explorer_controller?
      if @explorer  # Save vars for tree history array
        @x_show = params[:x_show]
        @sb[:action] = @lastaction = action
      end
      @record = identify_record(params[:id], controller_to_model)
      @view = session[:view]                  # Restore the view from the session to get column names for the display
      return if record_no_longer_exists?(@record, klass.to_s)

      @lastaction = action

      id = params[:show] ? params[:show] : params[:x_show]
      if id.present?
        @item = send_nested(@record, method).find(from_cid(id))

        drop_breadcrumb(:name => "#{@record.name} (#{display_name})",
                        :url  => "/#{controller_name}/#{action}/#{@record.id}?page=#{@current_page}")
        drop_breadcrumb(:name => @item.name,
                        :url  => "/#{controller_name}/#{action}/#{@record.id}?show=#{@item.id}")
        @view = get_db_view(klass, :association => association)
        show_item
      else
        drop_breadcrumb({:name => @record.name,
                         :url  => "/#{controller_name}/show/#{@record.id}"}, true)
        drop_breadcrumb(:name => "#{@record.name} (#{display_name})",
                        :url  => "/#{controller_name}/#{action}/#{@record.id}")
        @listicon = listicon

        show_details(klass, :association => association, :conditions => conditions)
      end
    end

    def guest_applications
      @use_action = true
      @explorer = true if request.xml_http_request? # Ajax request means in explorer
      @db = params[:db] ? params[:db] : request.parameters[:controller]
      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?
      get_record(@db)
      @sb[:action] = params[:action]
      return if record_no_longer_exists?(@record)

      @lastaction = "guest_applications"
      if !params[:show].nil? || !params[:x_show].nil?
        id = params[:show] ? params[:show] : params[:x_show]
        @item = @record.guest_applications.find(from_cid(id))
        if Regexp.new(/linux/).match(@record.os_image_name.downcase)
          drop_breadcrumb(:name => _("%{name} (Packages)") % {:name => @record.name},
                          :url  => "/#{@db}/guest_applications/#{@record.id}?page=#{@current_page}")
        else
          drop_breadcrumb(:name => _("%{name} (Applications)") % {:name => @record.name},
                          :url  => "/#{@db}/guest_applications/#{@record.id}?page=#{@current_page}")
        end
        drop_breadcrumb(:name => @item.name, :url => "/#{@db}/show/#{@record.id}?show=#{@item.id}")
        @view = get_db_view(GuestApplication)         # Instantiate the MIQ Report view object
        show_item
      else
        drop_breadcrumb({:name => @record.name, :url => "/#{@db}/show/#{@record.id}"}, true)
        if Regexp.new(/linux/).match(@record.os_image_name.downcase)
          drop_breadcrumb(:name => _("%{name} (Packages)") % {:name => @record.name},
                          :url  => "/#{@db}/guest_applications/#{@record.id}")
        else
          drop_breadcrumb(:name => _("%{name} (Applications)") % {:name => @record.name},
                          :url  => "/#{@db}/guest_applications/#{@record.id}")
        end
        @listicon = "guest_application"
        show_details(GuestApplication)
      end
    end

    def patches
      @use_action = true
      @explorer = true if request.xml_http_request? # Ajax request means in explorer
      @db = params[:db] ? params[:db] : request.parameters[:controller]
      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?
      get_record(@db)
      @sb[:action] = params[:action]
      return if record_no_longer_exists?(@record)

      @lastaction = "patches"
      if !params[:show].nil? || !params[:x_show].nil?
        id = params[:show] ? params[:show] : params[:x_show]
        @item = @record.patches.find(from_cid(id))
        drop_breadcrumb(:name => _("%{name} (Patches)") % {:name => @record.name},
                        :url  => "/#{@db}/patches/#{@record.id}?page=#{@current_page}")
        drop_breadcrumb(:name => @item.name, :url => "/#{@db}/patches/#{@record.id}?show=#{@item.id}")
        @view = get_db_view(Patch)
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Patches)") % {:name => @record.name},
                        :url  => "/#{@db}/patches/#{@record.id}")
        @listicon = "patch"
        show_details(Patch)
      end
    end

    def groups
      @use_action = true
      @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
      @db = params[:db] ? params[:db] : request.parameters[:controller]
      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?
      get_record(@db)
      @sb[:action] = params[:action]
      return if record_no_longer_exists?(@record)

      @lastaction = "groups"
      if !params[:show].nil? || !params[:x_show].nil?
        id = params[:show] ? params[:show] : params[:x_show]
        @item = @record.groups.find(from_cid(id))
        drop_breadcrumb(:name => _("%{name} (Groups)") % {:name => @record.name},
                        :url  => "/#{@db}/groups/#{@record.id}?page=#{@current_page}")
        drop_breadcrumb({:name => @item.name, :url => "/#{@db}/groups/#{@record.id}?show=#{@item.id}"})
        @user_names = @item.users
        @view = get_db_view(Account, :association => "groups")
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Groups)") % {:name => @record.name},
                        :url  => "/#{@db}/groups/#{@record.id}")
        @listicon = "group"
        show_details(Account, :association => "groups")
      end
    end

    def users
      @use_action = true
      @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
      @db = params[:db] ? params[:db] : request.parameters[:controller]
      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?
      get_record(@db)
      @sb[:action] = params[:action]
      return if record_no_longer_exists?(@record)

      @lastaction = "users"
      if !params[:show].nil? || !params[:x_show].nil?
        id = params[:show] ? params[:show] : params[:x_show]
        @item = @record.users.find(from_cid(id))
        drop_breadcrumb(:name => _("%{name} (Users)") % {:name => @record.name},
                        :url  => "/#{@db}/users/#{@record.id}?page=#{@current_page}")
        drop_breadcrumb(:name => @item.name, :url => "/#{@db}/show/#{@record.id}?show=#{@item.id}")
        @group_names = @item.groups
        @view = get_db_view(Account, :association => "users")
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Users)") % {:name => @record.name},
                        :url  => "/#{@db}/users/#{@record.id}")
        @listicon = "user"
        show_details(Account, :association => "users")
      end
    end

    def hosts
      @use_action = true
      @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
      @db = params[:db] ? params[:db] : request.parameters[:controller]
      @db = 'switch' if @db == 'infra_networking'
      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?
      get_record(@db)
      @sb[:action] = params[:action]
      return if record_no_longer_exists?(@record)

      @lastaction = "hosts"
      if !params[:show].nil? || !params[:x_show].nil?
        id = params[:show] ? params[:show] : params[:x_show]
        @item = @record.hosts.find(from_cid(id))
        drop_breadcrumb(:name => _("%{name} (Hosts)") % {:name => @record.name},
                        :url  => "/#{request.parameters[:controller]}/hosts/#{@record.id}?page=#{@current_page}")
        drop_breadcrumb(:name => @item.name, :url => "/#{request.parameters[:controller]}/show/#{@record.id}?show=#{@item.id}")
        @view = get_db_view(Host)
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Hosts)") % {:name => @record.name},
                        :url  => "/#{request.parameters[:controller]}/hosts/#{@record.id}")
        @listicon = "host"
        show_details(Host, :association => "hosts")
      end
    end

    # show a single item from a detail list
    def show_item
      @showtype = "item"
      if @explorer
        @refresh_partial = "layouts/#{@showtype}"
        replace_right_cell
      elsif request.xml_http_request?
        # reload toolbars - AJAX request
        c_tb = build_toolbar(center_toolbar_filename)
        render :update do |page|
          page << javascript_prologue
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
          page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace the main div area contents
          page << javascript_pf_toolbar_reload('center_tb', c_tb)
        end
      elsif controller_name == "ems_cloud"
        render :template => "shared/views/ems_common/show"
      else
        render :action => "show"
      end
    end

    # Build the vm detail gtl view
    def show_details(db, options = {})  # Pass in the db, parent vm is in @vm
      association = options[:association]
      conditions  = options[:conditions]
      # generate the grid/tile/list url to come back here when gtl buttons are pressed
      @gtl_url       = "/#{@db}/#{@listicon.pluralize}/#{@record.id}?"
      @showtype      = "details"
      @display       = "main"
      @no_checkboxes = @no_checkboxes.nil? || @no_checkboxes
      @showlinks     = true

      @view, @pages = get_view(db,
                               :parent      => @record,
                               :association => association,
                               :conditions  => conditions,
                               :dbname      => "#{@db}item")  # Get the records into a view & paginator

      if @explorer # In explorer?
        @refresh_partial = "vm_common/#{@showtype}"
        replace_right_cell
      else
        if pagination_request?
          replace_gtl_main_div
        elsif request.xml_http_request?
          # reload toolbars - AJAX request
          c_tb = build_toolbar(center_toolbar_filename)
          render :update do |page|
            page << javascript_prologue
            page.replace("flash_msg_div", :partial => "layouts/flash_msg")
            page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace main div area contents
            page << javascript_pf_toolbar_reload('center_tb', c_tb)
            page.replace_html("paging_div",
                              :partial => 'layouts/pagingcontrols',
                              :locals  => {:pages      => @pages,
                                           :action_url => @lastaction,
                                           :db         => @view.db,
                                           :headers    => @view.headers})
          end
        elsif controller_name == "ems_cloud"
          render :template => "shared/views/ems_common/show"
        else
          render :action => "show"
        end
      end
    end
  end
end
