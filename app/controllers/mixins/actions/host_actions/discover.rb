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
            redirect_to :action    => 'show_list',
                        :flash_msg => _("%{title} Discovery was cancelled by the user") % {:title => title}
          end
          @userid = ""
          @password = ""
          @verify = ""
          @client_id = ""
          @client_key = ""
          @azure_tenant_id = ""
          @subscription = ""
          if session[:type] == "hosts"
            @discover_type = Host.host_discovery_types
          elsif session[:type] == "ems"
            if request.parameters[:controller] == 'ems_infra'
              @discover_type = ExtManagementSystem.ems_infra_discovery_types
            else
              @discover_type = ManageIQ::Providers::CloudManager.subclasses.select(&:supports_discovery?).map do |cloud_manager|
                [cloud_manager.description, cloud_manager.ems_type]
              end
              @discover_type_selected = @discover_type.first.try!(:last)
            end
          else
            @discover_type = ExtManagementSystem.ems_infra_discovery_types
          end
          discover_type = []
          @discover_type_checked = []        # to keep track of checked items when start button is pressed
          @discover_type_selected = nil
          if params["start"]
            audit = {:event => "ms_and_host_discovery", :target_class => "Host", :userid => session[:userid]}
            if request.parameters[:controller] != "ems_cloud"
              from_ip = params[:from_first].to_s + "." + params[:from_second].to_s + "." + params[:from_third].to_s + "." + params[:from_fourth]
              to_ip = params[:from_first].to_s + "." + params[:from_second].to_s + "." + params[:from_third].to_s + "." + params[:to_fourth]

              i = 0
              while i < @discover_type.length
                if @discover_type.length == 1 || params["discover_type_#{@discover_type[i]}"]
                  discover_type.push(@discover_type[i].to_sym)
                  @discover_type_checked.push(@discover_type[i])
                end
                i += 1
              end

              @from = {}
              @from[:first] = params[:from_first]
              @from[:second] = params[:from_second]
              @from[:third] = params[:from_third]
              @from[:fourth] = params[:from_fourth]
              @to = {}
              @to[:first] = params[:from_first]
              @to[:second] = params[:from_second]
              @to[:third] = params[:from_third]
              @to[:fourth] = params[:to_fourth]
            end
            @in_a_form = true
            drop_breadcrumb(:name => _("%{title} Discovery") % {:title => title}, :url => "/host/discover")
            @discover_type_selected = params[:discover_type_selected]

            if request.parameters[:controller] == "ems_cloud" && params[:discover_type_selected] == 'azure'
              @client_id = params[:client_id] if params[:client_id]
              @client_key = params[:client_key] if params[:client_key]
              @azure_tenant_id = params[:azure_tenant_id] if params[:azure_tenant_id]
              @subscription = params[:subscription] if params[:subscription]

              if @client_id == "" || @client_key == "" || @azure_tenant_id == "" || @subscription == ""
                add_flash(_("Client ID, Client Key, Azure Tenant ID and Subscription ID are required"), :error)
                render :action => 'discover'
                return
              end
            elsif request.parameters[:controller] == "ems_cloud" || params[:discover_type_ipmi].to_s == "1"
              @userid = params[:userid] if  params[:userid]
              @password = params[:password] if params[:password]
              @verify = params[:verify] if params[:verify]
              if request.parameters[:controller] == "ems_cloud" && params[:userid] == ""
                add_flash(_("Username is required"), :error)
                render :action => 'discover'
                return
              end
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

            if request.parameters[:controller] != "ems_cloud" && discover_type.length <= 0
              add_flash(_("At least 1 item must be selected for discovery"), :error)
              render :action => 'discover'
            else
              begin
                if request.parameters[:controller] != "ems_cloud"
                  if params[:discover_type_ipmi].to_s == "1"
                    options = {:discover_types => discover_type, :credentials => {:ipmi => {:userid => @userid, :password => @password}}}
                  else
                    options = {:discover_types => discover_type}
                  end
                  Host.discoverByIpRange(from_ip, to_ip, options)
                else
                  cloud_manager = ManageIQ::Providers::CloudManager.subclasses.detect do |ems|
                    ems.supports_discovery? && ems.ems_type == params[:discover_type_selected]
                  end
                  if cloud_manager.ems_type == 'azure'
                    cloud_manager.discover_queue(@client_id, @client_key, @azure_tenant_id, @subscription)
                  else
                    cloud_manager.discover_queue(@userid, @password)
                  end
                end
              rescue => err
                #       @flash_msg = "'Host Discovery' returned: " + err.message; @flash_error = true
                add_flash(_("%{title} Discovery returned: %{error_message}") %
                  {:title => title, :error_message => err.message}, :error)
                render :action => 'discover'
                return
              else
                AuditEvent.success(audit.merge(:message => "#{title} discovery initiated (from_ip:[#{from_ip}], to_ip:[#{to_ip}])"))
                redirect_to :action    => 'show_list',
                            :flash_msg => _("%{model}: Discovery successfully initiated") % {:model => title}
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
            return _("Hosts / Nodes")
          else
            return ui_lookup(:tables => controller)
          end
        end

        # AJAX driven routine to check for changes in ANY field on the discover form
        def discover_field_changed
          render :update do |page|
            page << javascript_prologue
            if params[:from_first]
              # params[:from][:first] =~ /[a-zA-Z]/
              if params[:from_first] =~ /[\D]/
                temp = params[:from_first].gsub(/[\.]/, "")
                field_shift = true if params[:from_first] =~ /[\.]/ && params[:from_first].gsub(/[\.]/, "") =~ /[0-9]/ && temp.gsub!(/[\D]/, "").nil?
                page << "$('#from_first').val('#{j_str(params[:from_first]).gsub(/[\D]/, "")}');"
                page << javascript_focus('from_second') if field_shift
              else
                page << "$('#to_first').val('#{j_str(params[:from_first])}');"
                page << javascript_focus('from_second') if params[:from_first].length == 3
              end
            elsif params[:from_second]
              if params[:from_second] =~ /[\D]/
                temp = params[:from_second].gsub(/[\.]/, "")
                field_shift = true if params[:from_second] =~ /[\.]/ && params[:from_second].gsub(/[\.]/, "") =~ /[0-9]/ && temp.gsub!(/[\D]/, "").nil?
                page << "$('#from_second').val('#{j_str(params[:from_second].gsub(/[\D]/, ""))}');"
                page << javascript_focus('from_third') if field_shift
              else
                page << "$('#to_second').val('#{j_str(params[:from_second])}');"
                page << javascript_focus('from_third') if params[:from_second].length == 3
              end
            elsif params[:from_third]
              if params[:from_third] =~ /[\D]/
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
            if (request.parameters[:controller] == "ems_cloud" && params[:discover_type_selected]) || (params[:discover_type_ipmi] && params[:discover_type_ipmi].to_s == "1")
              if params[:discover_type_selected] && params[:discover_type_selected] == 'azure'
                page << javascript_hide("discover_credentials")
                page << javascript_show("discover_azure_credentials")
              elsif params[:discover_type_selected] && params[:discover_type_selected] == 'ec2'
                page << javascript_hide("discover_azure_credentials")
                page << javascript_show("discover_credentials")
              else
                @ipmi = true
                page << javascript_show("discover_credentials")
              end
            elsif params[:discover_type_ipmi] && params[:discover_type_ipmi].to_s == "null"
              @ipmi = false
              page << javascript_hide("discover_credentials")
            elsif @ipmi == false
              page << javascript_hide("discover_credentials")
            end
          end
        end
      end
    end
  end
end
