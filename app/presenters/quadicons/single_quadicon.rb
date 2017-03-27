module Quadicons
  class SingleQuadicon < Base
    def quadrant_list
      [:type_icon]
    end

    def link_builder
      LinkBuilders::SingleLinkBuilder
    end
  end
end
