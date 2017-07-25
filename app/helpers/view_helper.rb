module ViewHelper
  extend ActionView::Context
  extend ActionView::Helpers::TagHelper
  extend ActionView::Helpers::TextHelper
  extend ActionView::Helpers::CaptureHelper
  extend ActionView::Helpers::OutputSafetyHelper

  MAX_DESC_LEN = 255
  MAX_HOSTNAME_LEN = 255

  class << self
    def concat_tag(*args, &block)
      concat content_tag(*args, &block)
    end
  end
end
