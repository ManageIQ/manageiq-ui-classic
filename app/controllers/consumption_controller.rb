class ConsumptionController < ApplicationController
  def show
    @layout     = "consumption"
    @showtype   = "consumption"
  end

  alias_method :index, :show

  menu_section :cons
end
