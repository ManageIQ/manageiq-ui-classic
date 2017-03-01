module ApplicationController::Performance
  Options = Struct.new(
    :typ,               # Daily/Hourly/realtime/?
    :daily_date,        # date for :typ=Daily
    :hourly_date,       # date for :typ=Hourly
    :days,              # how many days back?
    :edate,             # end date for :typ=Hourly
    :edate_daily,       # end date for :typ=Daily
    :sdate,             # start date for :typ=Hourly
    :sdate_daily,       # start date for :typ=Daily
    :rt_minutes,        # minutes back for :typ=realtime
    :range,             # human readable date range
    :no_rollups,        # no rollups available, use realtime data
    :no_daily,          # if no daily data avail
    :cat,               # classification.name
    :cats,              # hash of available categories (model -> option)
    :cat_model,         # key to :cats hash
    :ght_type,          # hybrid/?
    :chart_type,        # :performance/:summary/:planning/:util_ts
    :index,             # index to charts, if one selected
    :model,             # class for which we query performance
    :parent,            # compare_to parent
    :top_type,          # for top CIs
    :top_model,
    :top_ts,
    :top_ids,
    :vmtype,            # selected vmtype
    :compare_vm,        # id of Vm to compare with
    :skip_days,         # which days to skip, based on time_profile_days
    :time_profile,
    :time_profile_days,
    :time_profile_tz,
    :tz,
    :tz_daily,
  ) do
    def update_from_params(params)
      self.typ         = params[:perf_typ]          if params[:perf_typ]
      self.days        = params[:perf_days]         if params[:perf_days]
      self.rt_minutes  = params[:perf_minutes].to_i if params[:perf_minutes]
      self.hourly_date = params[:miq_date_1]        if params[:miq_date_1] && typ == 'Hourly'
      self.daily_date  = params[:miq_date_1]        if params[:miq_date_1] && typ == 'Daily'
      self.index       = params[:chart_idx] == 'clear' ? nil : params[:chart_idx] if params[:chart_idx]
      self.parent      = params[:compare_to].blank? ? nil : params[:compare_to] if params.key?(:compare_to)
      self.compare_vm  = params[:compare_vm].blank? ? nil : params[:compare_vm] if params.key?(:compare_vm)
      self.vmtype      = params[:perf_vmtype] == '<All>' ? nil : params[:perf_vmtype] if params[:perf_vmtype]
      if params[:perf_cat]
        self.cat_model, self.cat = if params[:perf_cat] == '<None>'
                                     [nil, nil]
                                   else
                                     params[:perf_cat].split(':')
                                   end
      end
      if params.key?(:time_profile)
        if params[:time_profile].blank?
          self.time_profile = self.tz = self.time_profile_days = self.time_profile_tz = nil
        else
          tp = TimeProfile.find(params[:time_profile])
          self.time_profile = params[:time_profile].to_i
          self.tz = self.time_profile_tz = tp.tz
          self.time_profile_days = tp.days
        end
      end
    end

    def cats # category pulldown for tag charts
      return unless %w(EmsCluster Host Storage AvailabilityZone HostAggregate).include?(model)
      self[:cats] ||=
        begin
          cats = Classification.categories.select(&:show).sort_by(&:description)
          cats.delete_if { |c| c.read_only? || c.entries.empty? }
          ret_cats = {'<None>' => '<None>'}
          case model
          when 'Host', 'Storage', 'AvailabilityZone', 'HostAggregate'
            cats.each { |c| ret_cats['Vm:' + c.name] = 'VM ' + c.description }
          when 'EmsCluster'
            cats.each { |c| ret_cats['Host:' + c.name] = 'Host ' + c.description }
            cats.each { |c| ret_cats['Vm:' + c.name] = 'VM ' + c.description }
          end
          ret_cats
        end
    end

    def vmtypes
      if 'Storage' == model && typ == 'Daily'
        [['<All>', '<All>'],
         ['Managed/Registered', 'registered'],
         ['Managed/Unregistered', 'unregistered'],
         ['Not Managed', 'unmanaged']]
      end
    end
  end
end
