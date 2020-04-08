module Mixins
  module EmsCommon
    module Core
      def process_emss_task_destroy(emss)
        model.where(:id => emss).order(model.arel_table[:name].lower).each do |ems|
          audit = {:event        => "ems_record_delete_initiated",
                   :message      => "[#{ems.name}] Record delete initiated",
                   :target_id    => ems.id,
                   :target_class => model.to_s,
                   :userid       => session[:userid]}
          AuditEvent.success(audit)
        end
        model.destroy_queue(emss)
        if @flash_array.nil?
          add_flash(n_("Delete initiated for %{count} %{model} from the %{product} Database",
                       "Delete initiated for %{count} %{models} from the %{product} Database", emss.length) %
            {:count   => emss.length,
             :product => Vmdb::Appliance.PRODUCT_NAME,
             :model   => ui_lookup(:table => table_name),
             :models  => ui_lookup(:tables => table_name)})
        end
      end

      def process_emss_task_pause_resume(emss, task)
        action = task.split("_").first
        model.where(:id => emss).order(model.arel_table[:name].lower).each do |ems|
          audit = {:event        => "ems_record_#{action}_initiated",
                   :message      => "[#{ems.name}] Record #{action} initiated",
                   :target_id    => ems.id,
                   :target_class => model.to_s,
                   :userid       => session[:userid]}
          AuditEvent.success(audit)

          ems.pause! if action == "pause"
          ems.resume! if action == "resume"
        end
      end

      def process_emss_task_other(emss, task)
        model.where(:id => emss).order(model.arel_table[:name].lower).each do |ems|
          ems.send(task.to_sym) if ems.respond_to?(task) # Run the task
        rescue => bang
          add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{error_message}") %
            {:model => ui_lookup(:table => @table_name), :name => ems.name, :task => _(task.titleize), :error_message => bang.message}, :error)
          AuditEvent.failure(:userid       => session[:userid],
                             :event        => "#{table_name}_#{task}",
                             :message      => "#{ems.name}: Error during '#{task}': #{bang.message}",
                             :target_class => model.to_s, :target_id => ems.id)
        else
          add_flash(_("%{model} \"%{name}\": %{task} successfully initiated") % {:model => ui_lookup(:table => @table_name), :name => ems.name, :task => _(task.titleize)})
          AuditEvent.success(:userid       => session[:userid],
                             :event        => "#{table_name}_#{task}",
                             :message      => "#{ems.name}: '#{task}' successfully initiated",
                             :target_class => model.to_s, :target_id => ems.id)
        end
      end

      def process_emss(emss, task)
        emss, _emss_out_region = filter_ids_in_region(emss, "Provider")
        assert_rbac(model, emss)

        return if emss.empty?

        case task
        when 'destroy'
          process_emss_task_destroy(emss)
        when 'pause_ems', 'resume_ems'
          process_emss_task_pause_resume(emss, task)
        else
          process_emss_task_other(emss, task)
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
