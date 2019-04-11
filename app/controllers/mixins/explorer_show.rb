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

      id = params[:show] ? params[:show] : params[:x_show]
      if id.present?
        @item = send_nested(@record, method).find(id)
        @view = get_db_view(klass, :association => association)
        show_item
      else
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

      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.guest_applications.find(id)
        @view = get_db_view(GuestApplication)
        show_item
      else
        show_details(GuestApplication)
      end
    end

    def patches
      return unless init_show_variables

      @lastaction = "patches"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.patches.find(id)
        @view = get_db_view(Patch)
        show_item
      else
        show_details(Patch)
      end
    end

    def groups
      return unless init_show_variables

      @lastaction = "groups"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.groups.find(id)
        @user_names = @item.users
        @view = get_db_view(Account, :association => "groups")
        show_item
      else
        show_details(Account, :association => "groups")
      end
    end

    def users
      return unless init_show_variables

      @lastaction = "users"
      id = params[:show] || params[:x_show]
      if id.present?
        @item = @record.users.find(id)
        @group_names = @item.groups
        @view = get_db_view(Account, :association => "users")
        show_item
      else
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
        @view = get_db_view(Host)
        show_item
      else
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
      @showtype      = "details"
      @display       = "main"
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
