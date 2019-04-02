class SupportController < ApplicationController
  # # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  # verify  :method => :post, :only => [ :destroy, :create, :update ],
  #    :redirect_to => { :action => :index }

  before_action :check_privileges
  before_action :check_support_rbac
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def index
    about
    render :action => "show"
  end

  def show
  end

  def about
    @vmdb = {:version => Vmdb::Appliance.VERSION, :build => Vmdb::Appliance.BUILD}
    @user_role = User.current_user.miq_user_role_name
    @pdf_documents = pdf_documents
    @layout = "about"
  end

  private ############################

  def check_support_rbac
    handle_generic_rbac(role_allows?(:feature => 'documentation', :any => true))
  end

  def get_layout
    %w(about diagnostics).include?(session[:layout]) ? session[:layout] : "about"
  end

  def get_session_data
    @title  = _("Documentation")
    @layout = get_layout
  end

  def set_session_data
    session[:layout] = @layout
  end

  def pdf_document_files
    Dir.glob(Rails.root.join("public/doc/*.pdf"))
  end

  def pdf_documents
    pdf_document_files.sort.each_with_object({}) do |f, h|
      f = File.basename(f, ".pdf")
      h[f] = f.titleize
    end
  end
end
