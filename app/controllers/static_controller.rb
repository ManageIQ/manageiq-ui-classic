# used to serve static angular templates from under app/views/static/
#
# Much of this has been extracted from the `high_voltage` gem, and the LICENSE
# for that can be found below:
#
# Copyright 2010-2015 thoughtbot, inc.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

class ManageIQ::UI::Classic::InvalidPageIdError < StandardError; end

class StaticController < ActionController::Base
  # Added to satisfy Brakeman, https://github.com/presidentbeef/brakeman/pull/953
  protect_from_forgery :with => :exception

  VALID_CHARACTERS_REGXP = "^a-zA-Z0-9~!@$%^&*()#`_+-=<>\"{}|[];',?".freeze

  layout ->(_) { nil }

  rescue_from ActionView::MissingTemplate do |exception|
    if exception.message =~ /Missing template #{page_finder.content_path}/
      invalid_page
    else
      raise exception
    end
  end

  rescue_from ManageIQ::UI::Classic::InvalidPageIdError, :with => :invalid_page

  def show
    render :template => current_page
  end

  def invalid_page
    raise ActionController::RoutingError, "No such page: #{params[:id]}"
  end

  private

  def page_id
    @page_id ||= params[:id].to_s
  end

  def current_page
    "static/#{clean_path}"
  end

  def clean_path
    path = Pathname.new("/#{clean_id}")
    path.cleanpath.to_s[1..-1].tap do |p|
      if p.blank?
        raise ManageIQ::UI::Classic::InvalidPageIdError, "Invalid page id: #{params[:id]}"
      end
    end
  end

  def clean_id
    page_id.tr(VALID_CHARACTERS_REGXP, "").tap do |id|
      if invalid_page_id?(id)
        raise ManageIQ::UI::Classic::InvalidPageIdError, "Invalid page id: #{params[:id]}"
      end
    end
  end

  def invalid_page_id?(id)
    id.blank? || (id.first == ".")
  end
end
