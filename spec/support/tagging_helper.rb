module Spec
  module Support
    module TaggingHelper
      def get_tags_json(tags)
        return [] if tags.empty?

        JSON.dump([{:id => tags.first.parent_id, :values => tags.map { |tag| {:id => tag.id, :description => tag.description} }}])
      end
    end
  end
end
