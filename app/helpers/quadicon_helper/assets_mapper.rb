module QuadiconHelper
  class AssetsMapper
    class << self
      def img_status(item)
        case item.authentication_status
        when "Invalid" then "100/x.png"
        when "Valid"   then "100/checkmark.png"
        when "None"    then "100/unknown.png"
        else                "100/exclamationpoint.png"
        end
      end
    end
  end
end
