module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
