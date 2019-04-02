module OpsController::Settings::AutomateSchedules
  extend ActiveSupport::Concern

  def automate_schedules_set_vars
    schedule = params[:id] == "new" ? MiqSchedule.new : MiqSchedule.find_by(:id => params[:id])
    automate_request = fetch_automate_request_vars(schedule)
    render :json => {
      :starting_object => automate_request[:starting_object],
      :instance_names  => automate_request[:instance_names],
      :instance_name   => automate_request[:instance_name],
      :object_message  => automate_request[:object_message],
      :object_request  => automate_request[:object_request],
      :target_class    => automate_request[:object_class],
      :target_classes  => automate_request[:target_classes],
      :target_id       => automate_request[:target_id],
      :ui_attrs        => automate_request[:ui_attrs]
    }
  end

  def fetch_target_ids
    if params[:target_class] && params[:target_class] != 'null'
      targets = Rbac.filtered(params[:target_class]).select(:id, :name)
      unless targets.nil?
        targets = targets.sort_by { |t| t.name.downcase }.collect { |t| [t.name, t.id.to_s] }
      end
    end

    render :json => {
      :target_id => '',
      :targets   => targets
    }
  end

  def fetch_automate_request_vars(schedule)
    automate_request = {}
    # incase changing type of schedule
    filter = prebuild_automate_schedule(schedule)
    filter[:parameters].symbolize_keys!
    automate_request[:starting_object] = filter[:uri_parts][:namespace] || "SYSTEM/PROCESS"
    matching_instances = MiqAeClass.find_distinct_instances_across_domains(current_user,
                                                                           automate_request[:starting_object])
    automate_request[:instance_names] = matching_instances.collect(&:name).sort_by(&:downcase)
    automate_request[:instance_name]  = filter[:parameters][:instance_name] || "Request"
    automate_request[:object_message] = filter[:parameters][:object_message] || "create"
    automate_request[:object_request] = filter[:parameters][:request] || ""
    automate_request[:target_class]   = filter[:ui][:ui_object][:target_class] || nil
    automate_request[:target_classes] = {}
    CustomButton.button_classes.each { |db| automate_request[:target_classes][db] = ui_lookup(:model => db) }
    automate_request[:target_classes] = Array(automate_request[:target_classes].invert).sort
    if automate_request[:target_class]
      targets = Rbac.filtered(automate_request[:target_class]).select(:id, :name)
      automate_request[:targets] = targets.sort_by { |t| t.name.downcase }.collect { |t| [t.name, t.id.to_s] }
    end
    automate_request[:target_id]      = filter[:ui][:ui_object][:target_id] || ""
    automate_request[:ui_attrs]       = filter[:ui][:ui_attrs] || []

    if automate_request[:ui_attrs].empty?
      ApplicationController::AE_MAX_RESOLUTION_FIELDS.times { automate_request[:ui_attrs].push([]) }
    else
      # add empty array if @resolve[:new][:attrs] length is less than ApplicationController::AE_MAX_RESOLUTION_FIELDS
      len = automate_request[:ui_attrs].length
      ApplicationController::AE_MAX_RESOLUTION_FIELDS.times { automate_request[:ui_attrs].push([]) if len < ApplicationController::AE_MAX_RESOLUTION_FIELDS }
    end
    automate_request
  end

  def prebuild_automate_schedule(schedule)
    if schedule.filter && schedule.filter.kind_of?(Hash)
      schedule.filter
    else
      {:uri_parts  => {},
       :ui         => { :ui_attrs  => [],
                        :ui_object => {}},
       :parameters => {}}
    end
  end
end
