class ConsumptionController < ApplicationController
  def show
    assert_privileges("consumption")
    
    @layout     = "consumption"
    @showtype   = "consumption"
  end

  alias_method :index, :show

  menu_section :cons
end
