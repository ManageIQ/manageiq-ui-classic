module Mixins
  module ExplorerShow
    def send_nested(record, methods)
      obj = record
      Array(methods).each do |method|
        obj = obj.send(method)
      end
      obj
    end

    def show_association(action, display_name, method, klass, association = nil, scopes = nil)
      params[:display] = klass.name
      # Ajax request means in explorer, or if current explorer is one of the explorer controllers
      @explorer = true if request.xml_http_request? && explorer_controller?
      if @explorer # Save vars for tree history array
        @x_show = params[:x_show]
        @sb[:action] = @lastaction = action
      end
      @record = identify_record(params[:id], controller_to_model)
      @view = session[:view] # Restore the view from the session to get column names for the display
      return if record_no_longer_exists?(@record, klass.to_s)

      @lastaction = action

      id = params[:show] || params[:x_show]
      if id.present?
        @item = send_nested(@record, method).find(id)

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

        show_details(klass, :association => association, :scopes => scopes)
      end
    end

    def init_show_variables(db = nil)
      @explorer = true if request.xml_http_request? # Ajax request means in explorer

      @db = db || params[:db] || controller_name

      session[:db] = @db unless @db.nil?
      @db = session[:db] unless session[:db].nil?

      @record = get_record(@db)
      @sb[:action] = params[:action]

      !record_no_longer_exists?(@record)
    end

    def guest_applications
      return unless init_show_variables

      @lastaction = "guest_applications"

      breadcrumb_name = if Regexp.new(/linux/).match(@record.os_image_name.downcase)
                          _("Packages")
                        else
                          _("Applications")
                        end

      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.guest_applications.find(id)
        item_breadcrumbs(breadcrumb_name, 'guest_applications')
        @view = get_db_view(GuestApplication)
        show_item
      else
        drop_breadcrumb({:name => @record.name, :url => "/#{@db}/show/#{@record.id}"}, true)
        drop_breadcrumb(:name => breadcrumb_name % {:name => @record.name},
                        :url  => "/#{@db}/guest_applications/#{@record.id}")
        show_details(GuestApplication)
      end
    end

    def item_breadcrumbs(display_name, entity_path)
      drop_breadcrumb(:name => "#{@record.name} (#{display_name})",
                      :url  => "/#{controller_name}/#{entity_path}/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name, :url => "/#{controller_name}/show/#{@record.id}?show=#{@item.id}")
    end

    def patches
      return unless init_show_variables

      @lastaction = "patches"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.patches.find(id)
        item_breadcrumbs(_("Patches"), 'patches')
        @view = get_db_view(Patch)
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Patches)") % {:name => @record.name},
                        :url  => "/#{@db}/patches/#{@record.id}")
        show_details(Patch)
      end
    end

    def groups
      return unless init_show_variables

      @lastaction = "groups"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.groups.find(id)
        item_breadcrumbs(_("Groups"), 'groups')
        @user_names = @item.users
        @view = get_db_view(Account, :association => "groups")
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Groups)") % {:name => @record.name},
                        :url  => "/#{@db}/groups/#{@record.id}")
        show_details(Account, :association => "groups")
      end
    end

    def users
      return unless init_show_variables

      @lastaction = "users"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.users.find(id)
        item_breadcrumbs(_("Users"), 'users')
        @group_names = @item.groups
        @view = get_db_view(Account, :association => "users")
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Users)") % {:name => @record.name},
                        :url  => "/#{@db}/users/#{@record.id}")
        show_details(Account, :association => "users")
      end
    end

    def hosts
      db = params[:db] || controller_name
      db = 'switch' if db == 'infra_networking'
      return unless init_show_variables(db)

      @lastaction = "hosts"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.hosts.find(id)
        item_breadcrumbs(_("Hosts"), 'hosts')
        @view = get_db_view(Host)
        show_item
      else
        drop_breadcrumb(:name => _("%{name} (Hosts)") % {:name => @record.name},
                        :url  => "/#{controller_name}/hosts/#{@record.id}")
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
        render :update do |page|
          page << javascript_prologue
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
          page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace the main div area contents
          page << javascript_reload_toolbars
        end
      elsif controller_name == "ems_cloud"
        render :template => "shared/views/ems_common/show"
      else
        render :action => "show"
      end
    end

    # Build the vm detail gtl view
    def show_details(db, options = {})
      association = options[:association]
      scopes = options[:scopes]
      @showtype = "details"
      @display = "main"
      @no_checkboxes = @no_checkboxes.nil? || @no_checkboxes
      @showlinks     = true
      @view, @pages = get_view(db,
                               :parent      => @record,
                               :association => association,
                               :named_scope => scopes,
                               :dbname      => "#{@db}item") # Get the records into a view & paginator

      if @explorer # In explorer?
        @refresh_partial = "vm_common/#{@showtype}"
        replace_right_cell
      elsif request.xml_http_request?
        # reload toolbars - AJAX request
        render :update do |page|
          page << javascript_prologue
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
          page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace main div area contents
          page << javascript_reload_toolbars
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
