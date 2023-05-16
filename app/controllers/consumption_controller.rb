class ConsumptionController < ApplicationController
  def show
    assert_privileges("consumption")

    @layout     = "consumption"
    @showtype   = "consumption"
  end

  alias index show

  menu_section :cons
end
