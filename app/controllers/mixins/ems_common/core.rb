module Mixins
  module EmsCommon
    module Core
      def process_emss(emss, task)
        emss, _emss_out_region = filter_ids_in_region(emss, "Provider")
        assert_rbac(model, emss)

        return if emss.empty?

        if task == "destroy"
          model.where(:id => emss).order("lower(name)").each do |ems|
            id = ems.id
            ems_name = ems.name
            audit = {:event        => "ems_record_delete_initiated",
                     :message      => "[#{ems_name}] Record delete initiated",
                     :target_id    => id,
                     :target_class => model.to_s,
                     :userid       => session[:userid]}
            AuditEvent.success(audit)
          end
          model.destroy_queue(emss)
          add_flash(n_("Delete initiated for %{count} %{model} from the %{product} Database",
                       "Delete initiated for %{count} %{models} from the %{product} Database", emss.length) %
            {:count   => emss.length,
             :product => Vmdb::Appliance.PRODUCT_NAME,
             :model   => ui_lookup(:table => table_name),
             :models  => ui_lookup(:tables => table_name)}) if @flash_array.nil?
        elsif task == "pause_ems" || task == "resume_ems"
          action = task.split("_").first
          model.where(:id => emss).order("lower(name)").each do |ems|
            id = ems.id
            ems_name = ems.name
            audit = {:event        => "ems_record_#{action}_initiated",
                     :message      => "[#{ems_name}] Record #{action} initiated",
                     :target_id    => id,
                     :target_class => model.to_s,
                     :userid       => session[:userid]}
            AuditEvent.success(audit)

            ems.pause! if action == "pause"
            ems.resume! if action == "resume"
          end
        else
          model.where(:id => emss).order("lower(name)").each do |ems|
            id = ems.id
            ems_name = ems.name
            begin
              ems.send(task.to_sym) if ems.respond_to?(task)    # Run the task
            rescue => bang
              add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{error_message}") %
                {:model => ui_lookup(:table => @table_name), :name => ems_name, :task => _(task.titleize), :error_message => bang.message}, :error)
              AuditEvent.failure(:userid       => session[:userid],
                                 :event        => "#{table_name}_#{task}",
                                 :message      => "#{ems_name}: Error during '#{task}': #{bang.message}",
                                 :target_class => model.to_s, :target_id => id)
            else
              add_flash(_("%{model} \"%{name}\": %{task} successfully initiated") % {:model => ui_lookup(:table => @table_name), :name => ems_name, :task => _(task.titleize)})
              AuditEvent.success(:userid       => session[:userid],
                                 :event        => "#{table_name}_#{task}",
                                 :message      => "#{ems_name}: '#{task}' successfully initiated",
                                 :target_class => model.to_s, :target_id => id)
            end
          end
        end
      end

      def model
        self.class.model
      end

      def permission_prefix
        self.class.permission_prefix
      end
    end
  end
end
