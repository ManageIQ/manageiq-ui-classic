module Mixins
  module Actions
    module VmActions
      module Reconfigure
        def reconfigure(reconfigure_ids = [])
          @sb[:explorer] = true if @explorer
          @request_id = nil
          @in_a_form = @reconfigure = true
          drop_breadcrumb(:name => _("Reconfigure"), :url => "/vm_common/reconfigure")

          reconfigure_ids = params[:rec_ids] if params[:rec_ids]
          @request_id = params[:req_id] if params[:req_id]

          @reconfigitems = find_records_with_rbac(Vm, reconfigure_ids)
          build_targets_hash(@reconfigitems)
          @force_no_grid_xml = true
          @view, @pages = get_view(Vm, :view_suffix => "VmReconfigureRequest", :selected_ids => reconfigure_ids) # Get the records (into a view) and the paginator
          get_reconfig_limits(reconfigure_ids)

          if @reconfigitems.size == 1
            vm = @reconfigitems.first
            @vlan_options = get_vlan_options(vm.host_id)
            @avail_adapter_names = vm.try(:available_adapter_names) || []
            @iso_options = get_iso_options(vm)
          end

          unless @explorer
            render :action => "show"
          end
        end

        def reconfigure_update
          case params[:button]
          when "cancel" then reconfigure_handle_cancel_button
          when "submit" then reconfigure_handle_submit_button
          end
        end

        def reconfigure_form_fields
          @request_id, request_data = params[:id].split(/\s*,\s*/, 2)
          reconfigure_ids = request_data.split(/\s*,\s*/)
          request_hash = build_reconfigure_hash(reconfigure_ids)
          render :json => request_hash
        end

        # Reconfigure selected VMs
        def reconfigurevms
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          rec_cls = "vm"
          # if coming in to edit from miq_request list view
          recs = checked_or_params
          if !session[:checked_items].nil? && (@lastaction == "set_checked_items" || params[:pressed] == "miq_request_edit")
            recs = session[:checked_items]
            request_id = params[:id]
          end

          if recs.empty?
            add_flash(_("One or more %{model} must be selected to Reconfigure") %
              {:model => Dictionary.gettext(db.to_s, :type => :model, :notfound => :titleize, :plural => true)}, :error)
            javascript_flash(:scroll_top => true)
            return
          else

            if VmOrTemplate.includes_template?(recs)
              add_flash(_("Reconfigure does not apply because you selected at least one VM Template"), :error)
              javascript_flash(:scroll_top => true)
              return
            end
            unless VmOrTemplate.reconfigurable?(recs)
              add_flash(_("Reconfigure does not apply because you selected at least one un-reconfigurable VM"), :error)
              javascript_flash(:scroll_top => true)
              return
            end
            reconfigure_ids = recs.collect(&:to_i)
          end
          if @explorer
            reconfigure(reconfigure_ids)
            session[:changed] = true # need to enable submit button when screen loads
            @refresh_partial = "vm_common/reconfigure"
          elsif role_allows?(:feature => "vm_reconfigure")
            # redirect to build the ownership screen
            javascript_redirect(:controller => rec_cls.to_s, :action => 'reconfigure', :req_id => request_id, :rec_ids => reconfigure_ids, :escape => false)
          else
            head :ok
          end
        end

        alias_method :image_reconfigure, :reconfigurevms
        alias_method :instance_reconfigure, :reconfigurevms
        alias_method :vm_reconfigure, :reconfigurevms
        alias_method :miq_template_reconfigure, :reconfigurevms

        def get_reconfig_limits(reconfigure_ids)
          @reconfig_limits = VmReconfigureRequest.request_limits(:src_ids => reconfigure_ids)
          mem1, fmt1 = reconfigure_calculations(@reconfig_limits[:min__vm_memory])
          mem2, fmt2 = reconfigure_calculations(@reconfig_limits[:max__vm_memory])
          @reconfig_memory_note = _("Between %{min} and %{max}") % {:min => "#{mem1}#{fmt1}", :max => "#{mem2}#{fmt2}"}

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
        def build_reconfigure_hash(reconfigure_ids)
          @req = nil
          @reconfig_values = {}
          if @request_id == 'new'
            @reconfig_values = get_reconfig_info(reconfigure_ids)
          else
            @req = MiqRequest.find_by(:id => @request_id)
            @reconfig_values[:src_ids] = @req.options[:src_ids]
            @reconfig_values[:memory], @reconfig_values[:memory_type] = @req.options[:vm_memory] ? reconfigure_calculations(@req.options[:vm_memory]) : ['', '']
            @reconfig_values[:cores_per_socket_count] = @req.options[:cores_per_socket] ? @req.options[:cores_per_socket].to_s : ''
            @reconfig_values[:socket_count] = @req.options[:number_of_sockets] ? @req.options[:number_of_sockets].to_s : ''
            # check if there is only one VM that supports disk reconfiguration

            @reconfig_values[:disk_add] = @req.options[:disk_add]
            @reconfig_values[:disk_resize] = @req.options[:disk_resize]
            @reconfig_values[:cdrom_connect] = @req.options[:cdrom_connect]
            @reconfig_values[:cdrom_disconnect] = @req.options[:cdrom_disconnect]
            vmdisks = []
            vmcdroms = []
            @req.options[:disk_add]&.each do |disk|
              adsize, adunit = reconfigure_calculations(disk[:disk_size_in_mb])
              vmdisks << {:hdFilename          => disk[:disk_name],
                          :hdType              => disk[:thin_provisioned] ? 'thin' : 'thick',
                          :hdMode              => disk[:persistent] ? 'persistent' : 'nonpersistent',
                          :hdSize              => adsize.to_s,
                          :hdUnit              => adunit,
                          :new_controller_type => disk[:new_controller_type].to_s,
                          :cb_dependent        => disk[:dependent],
                          :cb_bootable         => disk[:bootable],
                          :add_remove          => 'add'}
            end

            reconfig_item = Vm.find(reconfigure_ids)
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
                vmdisk = {:hdFilename     => disk.filename,
                          :hdType         => disk.disk_type.to_s,
                          :hdMode         => disk.mode.to_s,
                          :hdSize         => dsize.to_s,
                          :hdUnit         => dunit.to_s,
                          :delete_backing => delbacking,
                          :cb_bootable    => disk.bootable,
                          :add_remove     => removing}
                vmdisks << vmdisk
              end
              cdroms = reconfig_item.first.hardware.cdroms
              if cdroms.present?
                vmcdroms = build_request_cdroms_list(cdroms)
              end
            end
            @reconfig_values[:disks] = vmdisks
            @reconfig_values[:cdroms] = vmcdroms
          end

          @reconfig_values[:cb_memory] = !!(@req && @req.options[:vm_memory]) # default for checkbox is false for new request
          @reconfig_values[:cb_cpu] = !!(@req && (@req.options[:number_of_sockets] || @req.options[:cores_per_socket])) # default for checkbox is false for new request
          @reconfig_values
        end

        def build_request_cdroms_list(cdroms)
          vmcdroms = []
          connect_disconnect = ''
          cdroms.map do |cd|
            id = cd.id
            device_name = cd.device_name
            type = cd.device_type
            filename = cd.filename
            storage_id = cd.storage_id
            if cd.filename && @req.options[:cdrom_disconnect]&.find { |d_cd| d_cd[:device_name] == cd.device_name }
              filename = ''
              connect_disconnect = 'disconnect'
            end
            conn_cd = @req.options[:cdrom_connect]&.find { |c_cd| c_cd[:device_name] == cd.device_name }
            if cd.filename && conn_cd
              filename = conn_cd[:filename]
              connect_disconnect = 'connect'
            end
            vmcdroms << {:id => id, :device_name => device_name, :filename => filename, :type => type, :storage_id => storage_id, :connect_disconnect => connect_disconnect}
          end
          vmcdroms
        end

        def reconfigure_calculations(mbsize)
          humansize = mbsize
          fmt = "MB"
          if mbsize.to_i > 1024 && (mbsize.to_i % 1024).zero?
            humansize = mbsize.to_i / 1024
            fmt = "GB"
          end
          return humansize.to_s, fmt
        end

        def get_vlan_options(host_id)
          vlan_options = []

          # determine available switches for this host...
          switch_ids = []
          Rbac.filtered(HostSwitch.where("host_id = ?", host_id)).each do |host_switch|
            switch_ids << host_switch.switch_id
          end

          Rbac.filtered(Lan.where("switch_id IN (?)", switch_ids)).each do |lan|
            vlan_options << lan.name
          end
          vlan_options
        end

        def get_iso_options(vm)
          iso_options = []

          datastore_ids = vm.host.storages.pluck(:id)
          # determine available iso files for the datastores
          Rbac.filtered(StorageFile.where("storage_id IN (?) and ext_name = 'iso'", datastore_ids)).each do |sf|
            iso_options << [sf.name, sf.name + ',' + sf.storage_id.to_s]
          end

          iso_options
        end

        def get_reconfig_info(reconfigure_ids)
          @reconfigureitems = Vm.find(reconfigure_ids).sort_by(&:name)
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
          @reconfigureitems.first.hardware.disks.sort_by(&:filename).each do |disk|
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

          # reconfiguring network adapters is only supported when one vm was selected
          network_adapters = []
          vmcdroms = []
          if @reconfigureitems.size == 1
            vm = @reconfigureitems.first

            if vm.supports_reconfigure_network_adapters?
              network_adapters = build_network_adapters_list(vm)
            end

            if vm.supports_reconfigure_cdroms?
              # CD-ROMS
              vmcdroms = build_vmcdrom_list(vm)
            end
          end

          {:objectIds              => reconfigure_ids,
           :memory                 => memory,
           :memory_type            => memory_type,
           :socket_count           => socket_count.to_s,
           :cores_per_socket_count => cores_per_socket.to_s,
           :disks                  => vmdisks,
           :network_adapters       => network_adapters,
           :cdroms                 => vmcdroms,
           :vm_vendor              => @reconfigureitems.first.vendor,
           :vm_type                => @reconfigureitems.first.class.name,
           :orchestration_stack_id => @reconfigureitems.first.try(:orchestration_stack_id),
           :disk_default_type      => @reconfigureitems.first.try(:disk_default_type) || 'thin'}
        end

        def supports_reconfigure_disks?
          @reconfigitems && @reconfigitems.size == 1 && @reconfigitems.first.supports_reconfigure_disks?
        end

        def build_network_adapters_list(vm)
          network_adapters = []
          vm.hardware.guest_devices.order(:device_name => 'asc').each do |guest_device|
            lan = Lan.find_by(:id => guest_device.lan_id)
            network_adapters << {:name => guest_device.device_name, :vlan => lan.name, :mac => guest_device.address, :add_remove => ''} unless lan.nil?
          end

          if vm.kind_of?(ManageIQ::Providers::Vmware::CloudManager::Vm)
            vm.network_ports.order(:name).each do |port|
              network_adapters << { :name => port.name, :network => port.cloud_subnets.try(:first).try(:name) || _('None'), :mac => port.mac_address, :add_remove => '' }
            end
          end
          network_adapters
        end

        def filename_string(name)
          # an empty cdrom filename can be in the form of a string containing a pair of square brackets
          name.blank? || name == '[]' ? '' : name.to_s
        end

        def build_vmcdrom_list(vm)
          vmcdroms = []
          cdroms = vm.hardware.cdroms
          if cdroms.present?
            cdroms.map do |cd|
              id = cd.id
              device_name = cd.device_name
              type = cd.device_type
              filename = filename_string(cd.filename)
              storage_id = cd.storage_id || ''
              vmcdroms << {:id => id, :device_name => device_name, :filename => filename, :type => type, :storage_id => storage_id}
            end
            vmcdroms
          end
        end

        def supports_reconfigure_disksize?
          @reconfigitems && @reconfigitems.size == 1 && @reconfigitems.first.supports_reconfigure_disksize? && @reconfigitems.first.supports_reconfigure_disks?
        end

        def supports_reconfigure_network_adapters?
          @reconfigitems && @reconfigitems.size == 1 && @reconfigitems.first.supports_reconfigure_network_adapters?
        end

        def supports_reconfigure_cdroms?
          @reconfigitems && @reconfigitems.size == 1 && @reconfigitems.first.supports_reconfigure_cdroms?
        end

        private

        # 'true' => true
        # 'false' => false
        # 'rootofevil' => 'rootofevil'
        # Example:
        #
        # {"a" => "true", "b" => "false", "c" => "42"}.transform_values! { |v| eval_if_bool_string(v) }
        # => {"a" => true, "b" => false, "c" => "42"}
        def eval_if_bool_string(s)
          case s
          when 'true'  then true
          when 'false' then false
          else              s
          end
        end

        def reconfigure_handle_cancel_button
          add_flash(_("VM Reconfigure Request was cancelled by the user"))
          if @sb[:explorer]
            @sb[:action] = nil
            replace_right_cell
          else
            session[:flash_msgs] = @flash_array
            javascript_redirect(previous_breadcrumb_url)
          end
        end

        def reconfigure_handle_submit_button
          options = {:src_ids => params[:objectIds]}
          if params[:cb_memory] == 'true'
            options[:vm_memory] = params[:memory_type] == "MB" ? params[:memory] : params[:memory].to_i * 1024
          end

          if params[:cb_cpu] == 'true'
            options[:cores_per_socket]  = params[:cores_per_socket_count].nil? ? 1 : params[:cores_per_socket_count].to_i
            options[:number_of_sockets] = params[:socket_count].nil? ? 1 : params[:socket_count].to_i
            vccores = params[:cores_per_socket_count].to_i.zero? ? 1 : params[:cores_per_socket_count].to_i
            vsockets = params[:socket_count].to_i.zero? ? 1 : params[:socket_count].to_i
            options[:number_of_cpus] = vccores * vsockets
          end

          # set the disk_add and disk_remove options
          [%i[vmAddDisks disk_add],
           %i[vmResizeDisks disk_resize],
           %i[vmRemoveDisks disk_remove],
           %i[vmAddNetworkAdapters network_adapter_add],
           %i[vmRemoveNetworkAdapters network_adapter_remove],
           %i[vmConnectCDRoms cdrom_connect],
           %i[vmDisconnectCDRoms cdrom_disconnect]].each do |params_key, options_key|
             next if params[params_key].blank?
             params[params_key].each do |_key, p|
               p.transform_values! { |v| eval_if_bool_string(v) }
             end
             options[options_key] = params[params_key].values.map(&:to_unsafe_h)
           end

          if params[:id] && params[:id] != 'new'
            @request_id = params[:id]
          end

          VmReconfigureRequest.make_request(@request_id, options, current_user)

          flash_to_session(_("VM Reconfigure Request was saved"))

          if role_allows?(:feature => "miq_request_show_list", :any => true)
            javascript_redirect(:controller => 'miq_request', :action => 'show_list')
          else
            url = previous_breadcrumb_url.split('/')
            javascript_redirect(:controller => url[1], :action => url[2])
          end
        end
      end
    end
  end
end
