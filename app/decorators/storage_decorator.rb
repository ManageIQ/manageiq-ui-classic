class StorageDecorator < MiqDecorator
  def self.fonticon
    'fa fa-database'
  end

  def fileicon
    percent = v_free_space_percent_of_total == 100 ? 20 : ((v_free_space_percent_of_total + 2) / 5.25).round # val is the percentage value of free space
    "100/piecharts/datastore/#{percent}.png"
  end
end
