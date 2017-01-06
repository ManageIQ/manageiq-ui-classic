module ViewHelper
  extend ActionView::Context
  extend ActionView::Helpers::TagHelper
  extend ActionView::Helpers::TextHelper
  extend ActionView::Helpers::CaptureHelper
  extend ActionView::Helpers::OutputSafetyHelper

  class << self
    def concat_tag(*args, &block)
      concat content_tag(*args, &block)
    end
  end
end
