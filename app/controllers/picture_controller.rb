class PictureController < ApplicationController
  skip_before_action :get_global_session_data
  skip_after_action :set_global_session_data

  # GET /pictures/:basename
  def show
    id, extension = params[:basename].split('.')

    picture = Picture.where(:extension => extension).find_by(:id => id)
    return head(404) unless picture

    fresh_when(:etag => picture.md5, :public => true)

    extension = 'svg+xml' if extension == 'svg'
    send_data(picture.content, :type => "image/#{extension}", :disposition => 'inline') if stale?
  end
end
