module Mixins
  module Actions
    module HostActions
      module Discover
        # Discover hosts
        def discover
          assert_privileges("#{controller_name}_discover")
          session[:type] = params[:discover_type] if params[:discover_type]
          title = set_discover_title(session[:type], request.parameters[:controller])
          if params["cancel"]
            flash_to_session(_("%{title} Discovery was cancelled by the user") % {:title => title})
            redirect_to(:action => 'show_list')
            return
          end
          @userid = @password = @verify = @client_id = @client_key = @azure_tenant_id = @subscription = ''
          if session[:type] == "ems"
            discover_type(request.parameters[:controller])
          else
            @discover_type = ExtManagementSystem.ems_infra_discovery_types
          end
          discover_type = []
          @discover_type_checked = [] # to keep track of checked items when start button is pressed
          @discover_type_selected = nil
          if params["start"]
            audit = {:event => "ms_and_host_discovery", :target_class => "Host", :userid => session[:userid]}
            from_ip = params[:from_first].to_s + "." + params[:from_second].to_s + "." + params[:from_third].to_s + "." + params[:from_fourth]
            to_ip   = params[:from_first].to_s + "." + params[:from_second].to_s + "." + params[:from_third].to_s + "." + params[:to_fourth]

            i = 0
            while i < @discover_type.length
              if @discover_type.length == 1 || params["discover_type_#{@discover_type[i]}"]
                discover_type.push(@discover_type[i].to_sym)
                @discover_type_checked.push(@discover_type[i])
              end
              i += 1
            end

            @from = {:first => params[:from_first], :second => params[:from_second], :third => params[:from_third], :fourth => params[:from_fourth]}
            @to   = {:first => params[:from_first], :second => params[:from_second], :third => params[:from_third], :fourth => params[:to_fourth]}
            @in_a_form = true
            drop_breadcrumb(:name => _("%{title} Discovery") % {:title => title}, :url => "/host/discover")
            @discover_type_selected = params[:discover_type_selected]

            if params[:discover_type_ipmi].to_s == "1"
              @userid = params[:userid] if  params[:userid]
              @password = params[:password] if params[:password]
              @verify = params[:verify] if params[:verify]
              if params[:userid] == "" && params[:password] != ""
                add_flash(_("Username must be entered if Password is entered"), :error)
                render :action => 'discover'
                return
              end
              if params[:password] != params[:verify]
                add_flash(_("Password/Verify Password do not match"), :error)
                render :action => 'discover'
                return
              end
            end

            if discover_type.length <= 0
              add_flash(_("At least 1 item must be selected for discovery"), :error)
              render :action => 'discover'
            else
              begin
                if request.parameters[:controller] == "ems_physical_infra"
                  validate_addresses(from_ip, to_ip, params[:port])
                  @discover_type_checked.each do |type|
                    physical_infra_manager = ManageIQ::Providers::PhysicalInfraManager.subclasses.detect do |ems|
                      ems.ems_type == type
                    end
                    ip_address = from_ip.split(".")
                    ip_address.last.to_i.upto(to_ip.split(".").last.to_i) do |addr|
                      ip = ip_address[0].to_s + "." + ip_address[1].to_s + "." + ip_address[2] + "." + addr.to_s
                      physical_infra_manager.discover_queue(ip, params[:port])
                    end
                  end
                else
                  options = if params[:discover_type_ipmi].to_s == "1"
                              {:discover_types => discover_type, :credentials => {:ipmi => {:userid => @userid, :password => @password}}}
                            else
                              {:discover_types => discover_type}
                            end
                  Host.discoverByIpRange(from_ip, to_ip, options)
                end
              rescue StandardError => err
                add_flash(_("%{title} Discovery returned: %{error_message}") % {:title => title, :error_message => err.message}, :error)
                render :action => 'discover'
                return
              else
                AuditEvent.success(audit.merge(:message => "#{title} discovery initiated (from_ip:[#{from_ip}], to_ip:[#{to_ip}])"))
                flash_to_session(_("%{model}: Discovery successfully initiated") % {:model => title})
                redirect_to(:action => 'show_list')
              end
            end
          end
          # Fell through, must be first time
          @in_a_form = true
          @title = _("%{title} Discovery") % {:title => title}
          @from = {:first => "", :second => "", :third => "", :fourth => ""}
          @to = {:first => "", :second => "", :third => "", :fourth => ""}
        end

        def set_discover_title(type, controller)
          if type == "hosts"
            _("Hosts")
          else
            ui_lookup(:tables => controller)
          end
        end

        # AJAX driven routine to check for changes in ANY field on the discover form
        def discover_field_changed
          render :update do |page|
            page << javascript_prologue
            if params[:from_first]
              # params[:from][:first] =~ /[a-zA-Z]/
              if /[\D]/.match?(params[:from_first])
                temp = params[:from_first].gsub(/[\.]/, "")
                field_shift = true if params[:from_first] =~ /[\.]/ && params[:from_first].gsub(/[\.]/, "") =~ /[0-9]/ && temp.gsub!(/[\D]/, "").nil?
                page << "$('#from_first').val('#{j_str(params[:from_first]).gsub(/[\D]/, "")}');"
                page << javascript_focus('from_second') if field_shift
              else
                page << "$('#to_first').val('#{j_str(params[:from_first])}');"
                page << javascript_focus('from_second') if params[:from_first].length == 3
              end
            elsif params[:from_second]
              if /[\D]/.match?(params[:from_second])
                temp = params[:from_second].gsub(/[\.]/, "")
                field_shift = true if params[:from_second] =~ /[\.]/ && params[:from_second].gsub(/[\.]/, "") =~ /[0-9]/ && temp.gsub!(/[\D]/, "").nil?
                page << "$('#from_second').val('#{j_str(params[:from_second].gsub(/[\D]/, ""))}');"
                page << javascript_focus('from_third') if field_shift
              else
                page << "$('#to_second').val('#{j_str(params[:from_second])}');"
                page << javascript_focus('from_third') if params[:from_second].length == 3
              end
            elsif params[:from_third]
              if /[\D]/.match?(params[:from_third])
                temp = params[:from_third].gsub(/[\.]/, "")
                field_shift = true if params[:from_third] =~ /[\.]/ && params[:from_third].gsub(/[\.]/, "") =~ /[0-9]/ && temp.gsub!(/[\D]/, "").nil?
                page << "$('#from_third').val('#{j_str(params[:from_third].gsub(/[\D]/, ""))}');"
                page << javascript_focus('from_fourth') if field_shift
              else
                page << "$('#to_third').val('#{j_str(params[:from_third])}');"
                page << javascript_focus('from_fourth') if params[:from_third].length == 3
              end
            elsif params[:from_fourth] && params[:from_fourth] =~ /[\D]/
              page << "$('#from_fourth').val('#{j_str(params[:from_fourth].gsub(/[\D]/, ""))}');"
            elsif params[:to_fourth] && params[:to_fourth] =~ /[\D]/
              page << "$('#to_fourth').val('#{j_str(params[:to_fourth].gsub(/[\D]/, ""))}');"
            end
            if params[:discover_type_ipmi] && params[:discover_type_ipmi].to_s == "1"
              @ipmi = true
              page << javascript_show("discover_credentials")
            elsif params[:discover_type_ipmi] && params[:discover_type_ipmi].to_s == "null"
              @ipmi = false
              page << javascript_hide("discover_credentials")
            elsif @ipmi == false
              page << javascript_hide("discover_credentials")
            end
          end
        end

        private

        def discover_type(controller)
          if controller == 'ems_infra'
            @discover_type = ExtManagementSystem.ems_infra_discovery_types
          elsif controller == 'ems_physical_infra'
            @discover_type = ExtManagementSystem.ems_physical_infra_discovery_types
          end
        end

        def validate_addresses(from_ip, to_ip, port)
          pattern = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/
          raise _("Starting address is malformed") if (from_ip =~ pattern).nil?
          raise _("Ending address is malformed") if (to_ip =~ pattern).nil?

          from_ip.split(".").each_index do |i|
            if to_ip.split(".")[i].to_i > 255 || to_ip.split(".")[i].to_i > 255
              raise _("IP address octets must be 0 to 255")
            end
            if from_ip.split(".")[i].to_i > to_ip.split(".")[i].to_i
              raise _("Ending address must be greater than starting address")
            end
          end

          raise _("Invalid port number") if port.to_i <= 0
          raise _("Port number must be 1 to 65535") if port.to_i > 65_535
        end
      end
    end
  end
end
