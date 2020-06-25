class ConsumptionController < ApplicationController
  def show
    assert_privileges("consumption")
    
    @layout     = "consumption"
    @showtype   = "consumption"
  end

  menu_section :cons
end
