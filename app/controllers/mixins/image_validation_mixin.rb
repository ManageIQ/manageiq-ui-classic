module Mixins
  module ImageValidationMixin
    private

    # @param file request parameter for a file
    # @param ext if present, the only extension supported (default: nil / accept all extensions)
    def valid_image_file?(file, type = nil)
      ext = file.original_filename.split(".").last.downcase
      return false if type && !Array.wrap(type).include?(ext)
  
      valid_magic_number =
        case ext
        when "ico"
          "\x00\x00\x01\x00".force_encoding("ASCII-8BIT")
        when "png"
          "\x89PNG\r\n\x1A\n".force_encoding("ASCII-8BIT")
        when "jpg"
          "\xff\xd8\xff".force_encoding("ASCII-8BIT")
        else
          return false
        end
  
      magic_number = File.open(file.tempfile.path, 'rb') do |f|
        f.readpartial(valid_magic_number.size)
      end
  
      magic_number == valid_magic_number
    rescue EOFError
      return false
    end      
  end
end
