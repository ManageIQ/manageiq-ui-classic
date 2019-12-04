module ApplicationController::Performance
  ChartClickData = Struct.new(
    :legend_index,
    :data_index,
    :chart_index,
    :cmd,
    :model,
    :type
  )
end
