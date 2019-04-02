module Mixins
  module MenuUpdateMixin
    def menu_section_url
      url = CGI.unescape(params[:url])
      section = Menu::Manager.section(params[:section]) || Menu::Manager.section_for_item_id(params[:section])
      section.parent_path.each do |sid|
        session[:tab_url][sid] = url
      end
    end
  end
end
