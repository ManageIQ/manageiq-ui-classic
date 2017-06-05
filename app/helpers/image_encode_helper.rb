module ImageEncodeHelper
  def encodable_image_tag(source, options = {})
    image_tag(encodable_image_source(source), options)
  end
  alias eimage_tag encodable_image_tag

  def encodable_image_source(source)
    if base64_encode_images? && source.present?
      base64_encoded_uri(source)
    else
      path_to_image(source)
    end
  end
  alias eimage_source encodable_image_source

  def base64_encode_images?
    @base64_encode_images
  end

  def base64_encoded_uri(source)
    asset = Rails.application.assets[source]

    if asset.content_type == 'image/svg+xml'
      encoding = 'charset=utf-8'
      data = CGI.escape(asset.source).gsub('+', '%20')
    else
      encoding = 'base64'
      data = Base64.encode64(asset.source)
    end

    "data:#{asset.content_type};#{encoding},#{data}"
  end
end
