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
    :chart_type,        # :performance/:summary/:util_ts
    :index,             # index to charts, if one selected
    :model,             # class for which we query performance
    :parent,            # compare_to parent
    :top_type,          # for top CIs
    :top_model,
    :top_ts,
    :top_ids,
    :vmtype,            # selected vmtype
    :skip_days,         # which days to skip, based on time_profile_days
    :time_profile,
    :time_profile_days,
    :time_profile_tz,
    :tz,
    :tz_daily
  ) do
    def update_from_params(params)
      self.typ         = params[:perf_typ]          if params[:perf_typ]
      self.days        = params[:perf_days]         if params[:perf_days]
      self.rt_minutes  = params[:perf_minutes].to_i if params[:perf_minutes]
      self.hourly_date = params[:miq_date_1]        if params[:miq_date_1] && typ == 'Hourly'
      self.daily_date  = params[:miq_date_1]        if params[:miq_date_1] && typ == 'Daily'
      self.index       = params[:chart_idx] == 'clear' ? nil : params[:chart_idx] if params[:chart_idx]
      self.parent      = params[:compare_to].presence if params.key?(:compare_to)
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

    def set_dates(start_date, end_date, allow_interval_override)
      tz = time_profile_tz || self.tz # Use time profile tz or chosen tz, if no profile tz
      self.sdate = start_date.in_time_zone(tz)
      self.edate = end_date.in_time_zone(tz)
      self.sdate_daily = sdate.hour.zero? ? sdate : sdate + 1.day
      self.edate_daily = edate.hour < 23 ? edate - 1.day : edate

      if typ == 'Daily' && edate_daily < sdate_daily
        self.no_daily = true
        self.typ = 'Hourly' if allow_interval_override
      else
        self.no_daily = false
      end

      if hourly_date.present? &&
         (hourly_date.to_date < sdate.to_date || hourly_date.to_date > edate.to_date || # it is out of range
         (typ == 'Hourly' && time_profile && !time_profile_days.include?(hourly_date.to_date.wday))) # or out of profile
        self.hourly_date = nil
      end
      if daily_date.present? &&
         (daily_date.to_date < sdate_daily.to_date || daily_date.to_date > edate_daily.to_date)
        self.daily_date = nil
      end
      self.hourly_date ||= [edate.month, edate.day, edate.year].join('/')
      self.daily_date  ||= [edate_daily.month, edate_daily.day, edate_daily.year].join('/')

      if typ == 'Hourly' && time_profile # If hourly and profile in effect, set hourly date to a valid day in profile
        self.skip_days = (1..7).to_a.delete_if do |d|
          # time_profile_days has 0 for sunday, skip_days needs 7 for sunday
          time_profile_days.include?(d % 7)
        end

        hdate = hourly_date.to_date                                       # Start at the currently set hourly date
        6.times do                                                        # Go back up to 6 days (try each weekday)
          break if time_profile_days.include?(hdate.wday)                 # If weekday is in the profile, use it

          hdate -= 1.day                                                  # Drop back 1 day and try again
        end
        self.hourly_date = [hdate.month, hdate.day, hdate.year].join('/') # Set the new hourly date
      else
        self.skip_days = nil
      end
    end

    # category pulldown for tag charts
    def cats
      return unless %w[EmsCluster Host Storage AvailabilityZone HostAggregate].include?(model)

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
      if model == 'Storage' && typ == 'Daily'
        [['<All>', '<All>'],
         ['Managed/Registered', 'registered'],
         ['Managed/Unregistered', 'unregistered'],
         ['Not Managed', 'unmanaged']]
      end
    end

    def to_calendar
      if typ == 'Hourly'
        { :skip_days => skip_days, :date_from => sdate, :date_to => edate }
      else
        { :skip_days => skip_days, :date_from => sdate_daily, :date_to => edate_daily }
      end
    end
  end
end
