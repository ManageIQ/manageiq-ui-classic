module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper
  include StProvDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
