class PictureController < ApplicationController
  skip_before_action :get_global_session_data
  skip_after_action :set_global_session_data

  def show # GET /pictures/:basename
    id, extension = params[:basename].split('.')
    picture = Picture.find_by_id(id)
    if picture && picture.extension == extension
      render_picture_content(picture)
    else
      head :not_found
    end
  end

  private

  def render_picture_content(picture)
    response.headers['Cache-Control'] = "public"
    response.headers['Content-Type'] = "image/#{picture.extension}"
    response.headers['Content-Disposition'] = "inline"
    render :body => picture.content
  end
end
