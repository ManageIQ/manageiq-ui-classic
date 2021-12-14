module CatalogHelper
  include_concern 'TextualSummary'

  def catalog_data
    @initial_data = "test"
  end
end
