module ReportHelper
  TIMER_DAYS = [
    [N_("Day"), "1"],
    [N_("2 Days"), "2"],
    [N_("3 Days"), "3"],
    [N_("4 Days"), "4"],
    [N_("5 Days"), "5"],
    [N_("6 Days"), "6"],
  ].freeze

  TIMER_HOURS = [
    [N_("Hour"), "1"],
    [N_("2 Hours"), "2"],
    [N_("3 Hours"), "3"],
    [N_("4 Hours"), "4"],
    [N_("6 Hours"), "6"],
    [N_("8 Hours"), "8"],
    [N_("12 Hours"), "12"],
  ].freeze

  TIMER_WEEKS = [
    [N_("Week"), "1"],
    [N_("2 Weeks"), "2"],
    [N_("3 Weeks"), "3"],
    [N_("4 Weeks"), "4"],
  ].freeze

  TIMER_MONTHS = [
    [N_("Month"), "1"],
    [N_("2 Months"), "2"],
    [N_("3 Months"), "3"],
    [N_("4 Months"), "4"],
    [N_("5 Months"), "5"],
    [N_("6 Months"), "6"],
  ].freeze

  Timer = Struct.new(
    :typ,
    :months,
    :weeks,
    :days,
    :hours,
    :start_date,
    :start_hour,
    :start_min
  ) do
    def initialize(typ = nil, months = 1, weeks = 1, days = 1, hours = 1, start_date = nil, start_hour = '00',
                   start_min = '00')
      super
    end

    def update_from_hash(params)
      %w[typ moths weeks days hours].each do |i|
        self[i] = params[:"timer_#{i}"] if params[:"timer_#{i}"]
      end
      %w[start_hour start_min].each do |i|
        self[i] = params[i.to_sym] if params[i.to_sym]
      end
      self.start_date = params[:miq_date_1] if params[:miq_date_1]
      if params[:time_zone]
        t = Time.now.in_time_zone(params[:timezone]) + 1.day # Default date/time to tomorrow in selected time zone
        self.start_date = "#{t.month}/#{t.day}/#{t.year}" # Reset the start date
        self.start_hour = '00' # Reset time to midnight
        self.start_min = '00'
      end
    end

    def update_from_miq_schedule(run_at, timezone)
      self.typ    = run_at[:interval][:unit].titleize
      self.months = run_at[:interval][:value] if run_at[:interval][:unit] == 'monthly'
      self.weeks  = run_at[:interval][:value] if run_at[:interval][:unit] == 'weekly'
      self.days   = run_at[:interval][:value] if run_at[:interval][:unit] == 'daily'
      self.hours  = run_at[:interval][:value] if run_at[:interval][:unit] == 'hourly'
      t = run_at[:start_time].utc.in_time_zone(timezone)
      self.start_hour = t.strftime("%H")
      self.start_min = t.strftime("%M")
      self.start_date = "#{t.month}/#{t.day}/#{t.year}"
    end

    def flush_to_miq_schedule(run_at, timezone)
      run_at ||= {}
      run_at[:start_time] = "#{start_time_in_utc(timezone)} Z"
      run_at[:tz]         = timezone
      run_at[:interval] ||= {}
      run_at[:interval][:unit] = typ.downcase
      case typ.downcase
      when 'monthly' then run_at[:interval][:value] = months
      when 'weekly'  then run_at[:interval][:value] = weeks
      when 'daily'   then run_at[:interval][:value] = days
      when 'hourly'  then run_at[:interval][:value] = hours
      else run_at[:interval].delete(:value)
      end
      run_at
    end

    private

    def start_time_in_utc(timezone)
      create_time_in_utc("#{start_date} #{start_hour}:#{start_min}:00", timezone)
    end
  end

  class Timer
    include Mixins::TimeHelper
  end
end
