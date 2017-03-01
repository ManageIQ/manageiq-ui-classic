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
    :vmtypes,           # <All>/registered/unregistered/unmanaged
    :vmtype,            # selected vmtype
    :compare_vm,        # id of Vm to compare with
    :skip_days,         # which days to skip, based on time_profile_days
    :time_profile,
    :time_profile_days,
    :time_profile_tz,
    :tz,
    :tz_daily,
  ) do
  end
end
