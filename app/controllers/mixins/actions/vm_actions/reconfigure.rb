module Mixins
  module Actions
    module VmActions
      module Reconfigure
        def reconfigure
          @sb[:explorer] = true if @explorer
          @request_id = nil
          @in_a_form = @reconfigure = true
          drop_breadcrumb(:name => _("Reconfigure"), :url => "/vm_common/reconfigure")
          if params[:rec_ids]
            @reconfigure_items = params[:rec_ids]
          end
          if params[:req_id]
            @request_id = params[:req_id]
          end
          @reconfigitems = Vm.find(@reconfigure_items).sort_by(&:name) # Get the db records
          build_targets_hash(@reconfigitems)
          @force_no_grid_xml   = true
          @view, @pages = get_view(Vm, :view_suffix => "VmReconfigureRequest", :where_clause => ["vms.id IN (?)", @reconfigure_items])  # Get the records (into a view) and the paginator
          get_reconfig_limits
          unless @explorer
            render :action => "show"
          end
        end

        def reconfigure_update
          case params[:button]
          when "cancel"
            add_flash(_("VM Reconfigure Request was cancelled by the user"))
            if @sb[:explorer]
              @sb[:action] = nil
              replace_right_cell
            else
              session[:flash_msgs] = @flash_array
              javascript_redirect previous_breadcrumb_url
            end
          when "submit"
            options = {:src_ids => params[:objectIds]}
            if params[:cb_memory] == 'true'
              options[:vm_memory] = params[:memory_type] == "MB" ? params[:memory] : (params[:memory].to_i.zero? ? params[:memory] : params[:memory].to_i * 1024)
            end
            if params[:cb_cpu] == 'true'
              options[:cores_per_socket]  = params[:cores_per_socket_count].nil? ? 1 : params[:cores_per_socket_count].to_i
              options[:number_of_sockets] = params[:socket_count].nil? ? 1 : params[:socket_count].to_i
              vccores = params[:cores_per_socket_count] == 0 ? 1 : params[:cores_per_socket_count]
              vsockets = params[:socket_count] == 0 ? 1 : params[:socket_count]
              options[:number_of_cpus] = vccores.to_i * vsockets.to_i
            end
            # set the disk_add and disk_remove options
            if params[:vmAddDisks]
              params[:vmAddDisks].values.each do |p|
                p.transform_values!{ |v|
                  case v
                    when 'true'
                      true
                    when 'false'
                      false
                    else
                      v
                  end }
              end
              options[:disk_add] = params[:vmAddDisks].values
            end

            if params[:vmRemoveDisks]
              params[:vmRemoveDisks].values.each do |p|
                p.transform_values!{ |v|
                  case v
                  when 'true'
                    true
                  when 'false'
                    false
                  else
                    v
                  end }
              end
              options[:disk_remove] = params[:vmRemoveDisks].values
            end

            if(params[:id] && params[:id] != 'new')
              @request_id = params[:id]
            end

            VmReconfigureRequest.make_request(@request_id, options, current_user)
            flash = _("VM Reconfigure Request was saved")

            if role_allows?(:feature => "miq_request_show_list", :any => true)
              javascript_redirect :controller => 'miq_request', :action => 'show_list', :flash_msg => flash
            else
              url = previous_breadcrumb_url.split('/')
              javascript_redirect :controller => url[1], :action => url[2], :flash_msg => flash
            end

            if @flash_array
              javascript_flash
              return
            end
          end
        end

        def reconfigure_form_fields
          request_data = ''
          @request_id, request_data = params[:id].split(/\s*,\s*/, 2)
          @reconfigure_items = request_data.split(/\s*,\s*/)
          request_hash = build_reconfigure_hash
          render :json => request_hash
        end

        # Reconfigure selected VMs
        def reconfigurevms
          assert_privileges(params[:pressed])
          @request_id = nil
          # check to see if coming from show_list or drilled into vms from another CI
          rec_cls = "vm"
          recs = []
          # if coming in to edit from miq_request list view
          if !session[:checked_items].nil? && (@lastaction == "set_checked_items" || params[:pressed] == "miq_request_edit")
            @request_id = params[:id]
            recs = session[:checked_items]
          elsif !params[:id] || params[:pressed] == 'vm_reconfigure'
            recs = find_checked_ids_with_rbac(VmOrTemplate)
          end
          if recs.blank?
            recs = [find_id_with_rbac(VmOrTemplate, params[:id]).to_i]
          end
          if recs.length < 1
            add_flash(_("One or more %{model} must be selected to Reconfigure") %
              {:model => Dictionary.gettext(db.to_s, :type => :model, :notfound => :titleize, :plural => true)}, :error)
            javascript_flash(:scroll_top => true)
            return
          else

            if VmOrTemplate.includes_template?(recs)
              add_flash(_("Reconfigure does not apply because you selected at least one %{model}") %
                {:model => ui_lookup(:table => "miq_template")}, :error)
              javascript_flash(:scroll_top => true)
              return
            end
            unless VmOrTemplate.reconfigurable?(recs)
              add_flash(_("Reconfigure does not apply because you selected at least one un-reconfigurable VM"), :error)
              javascript_flash(:scroll_top => true)
              return
            end
            @reconfigure_items = recs.collect(&:to_i)
          end
          if @explorer
            reconfigure
            session[:changed] = true  # need to enable submit button when screen loads
            @refresh_partial = "vm_common/reconfigure"
          else
            if role_allows?(:feature => "vm_reconfigure")
              javascript_redirect :controller => rec_cls.to_s, :action => 'reconfigure', :req_id => @request_id, :rec_ids => @reconfigure_items, :escape => false # redirect to build the ownership screen
            else
              head :ok
            end
          end
        end

        alias_method :image_reconfigure, :reconfigurevms
        alias_method :instance_reconfigure, :reconfigurevms
        alias_method :vm_reconfigure, :reconfigurevms
        alias_method :miq_template_reconfigure, :reconfigurevms

        def get_reconfig_limits
          @reconfig_limits = VmReconfigureRequest.request_limits(:src_ids => @reconfigure_items)
          mem1, fmt1 = reconfigure_calculations(@reconfig_limits[:min__vm_memory])
          mem2, fmt2 = reconfigure_calculations(@reconfig_limits[:max__vm_memory])
          @reconfig_memory_note = "Between #{mem1}#{fmt1} and #{mem2}#{fmt2}"

          @socket_options = []
          @reconfig_limits[:max__number_of_sockets].times do |tidx|
            idx = tidx + @reconfig_limits[:min__number_of_sockets]
            @socket_options.push(idx) if idx <= @reconfig_limits[:max__number_of_sockets]
          end

          @cores_options = []
          @reconfig_limits[:max__cores_per_socket].times do |tidx|
            idx = tidx + @reconfig_limits[:min__cores_per_socket]
            @cores_options.push(idx) if idx <= @reconfig_limits[:max__cores_per_socket]
          end
        end

        # Build the reconfigure data hash
        def build_reconfigure_hash
          @req = nil
          @reconfig_values = {}
          if @request_id == 'new'
            @reconfig_values = get_reconfig_info
          else
            @req = MiqRequest.find_by_id(@request_id)
            @reconfig_values[:src_ids] = @req.options[:src_ids]
            @reconfig_values[:memory], @reconfig_values[:memory_type] = @req.options[:vm_memory] ? reconfigure_calculations(@req.options[:vm_memory]) : ['','']
            @reconfig_values[:cores_per_socket_count] = @req.options[:cores_per_socket] ? @req.options[:cores_per_socket].to_s : ''
            @reconfig_values[:socket_count] = @req.options[:number_of_sockets] ? @req.options[:number_of_sockets].to_s : ''
            # check if there is only one VM that supports disk reconfiguration

            @reconfig_values[:disk_add] = @req.options[:disk_add]
            @reconfig_values[:disk_remove] = @req.options[:disk_remove]
            vmdisks = []
            if @req.options[:disk_add]
              @req.options[:disk_add].each do |disk|
                adsize, adunit = reconfigure_calculations(disk[:disk_size_in_mb])
                vmdisks << {:hdFilename   => disk[:disk_name],
                            :hdType       => disk[:thin_provisioned] ? 'thin' : 'thick',
                            :hdMode       => disk[:persistent] ? 'persistent' : 'nonpersistent',
                            :hdSize       => adsize.to_s,
                            :hdUnit       => adunit,
                            :cb_dependent => disk[:dependent],
                            :cb_bootable  => disk[:bootable],
                            :add_remove   => 'add'}
              end
            end

            reconfig_item = Vm.find(@reconfigure_items)
            if reconfig_item
              reconfig_item.first.hardware.disks.each do |disk|
                next if disk.device_type != 'disk'
                removing = ''
                delbacking = false
                if disk.filename && @req.options[:disk_remove]
                  @req.options[:disk_remove].each do |remdisk|
                    if remdisk[:disk_name] == disk.filename
                      removing = 'remove'
                      delbacking = remdisk[:delete_backing]
                    end
                  end
                end
                dsize, dunit = reconfigure_calculations(disk.size / (1024 * 1024))
                vmdisks << {:hdFilename     => disk.filename,
                            :hdType         => disk.disk_type.to_s,
                            :hdMode         => disk.mode.to_s,
                            :hdSize         => dsize.to_s,
                            :hdUnit         => dunit.to_s,
                            :delete_backing => delbacking,
                            :cb_bootable    => disk.bootable,
                            :add_remove     => removing}
              end
            end
            @reconfig_values[:disks] = vmdisks
          end

          @reconfig_values[:cb_memory] = !!(@req && @req.options[:vm_memory])       # default for checkbox is false for new request
          @reconfig_values[:cb_cpu] =  !!(@req && ( @req.options[:number_of_sockets] || @req.options[:cores_per_socket]))     # default for checkbox is false for new request
          @reconfig_values
        end

        def reconfigure_calculations(mbsize)
          humansize = mbsize
          fmt = "MB"
          if mbsize.to_i > 1024 && mbsize.to_i % 1024 == 0
            humansize = mbsize.to_i / 1024
            fmt = "GB"
          end
          return humansize.to_s, fmt
        end

        def get_reconfig_info
          @reconfigureitems = Vm.find(@reconfigure_items).sort_by(&:name)
          # set memory to nil if multiple items were selected with different mem_cpu values
          memory = @reconfigureitems.first.mem_cpu
          memory = nil unless @reconfigureitems.all? { |vm| vm.mem_cpu == memory }

          socket_count = @reconfigureitems.first.num_cpu
          socket_count = '' unless @reconfigureitems.all? { |vm| vm.num_cpu == socket_count }

          cores_per_socket = @reconfigureitems.first.cpu_cores_per_socket
          cores_per_socket = '' unless @reconfigureitems.all? { |vm| vm.cpu_cores_per_socket == cores_per_socket }
          memory, memory_type = reconfigure_calculations(memory)

          # if only one vm that supports disk reconfiguration is selected, get the disks information
          vmdisks = []
          @reconfigureitems.first.hardware.disks.each do |disk|
            next if disk.device_type != 'disk'
            dsize, dunit = reconfigure_calculations(disk.size / (1024 * 1024))
            vmdisks << {:hdFilename  => disk.filename,
                        :hdType      => disk.disk_type,
                        :hdMode      => disk.mode,
                        :hdSize      => dsize,
                        :hdUnit      => dunit,
                        :add_remove  => '',
                        :cb_bootable => disk.bootable}
          end

          {:objectIds              => @reconfigure_items,
           :memory                 => memory,
           :memory_type            => memory_type,
           :socket_count           => socket_count.to_s,
           :cores_per_socket_count => cores_per_socket.to_s,
           :disks                  => vmdisks}
        end

        def supports_reconfigure_disks?
          @reconfigitems && @reconfigitems.size == 1 && @reconfigitems.first.supports_reconfigure_disks?
        end

      end
    end
  end
end
