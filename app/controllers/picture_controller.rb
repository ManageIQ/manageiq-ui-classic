class PictureController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin

  def show # GET /pictures/:basename
    @edit = session[:edit]
    compressed_id, extension = params[:basename].split('.')
    picture = Picture.find_by_id(from_cid(compressed_id))
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
