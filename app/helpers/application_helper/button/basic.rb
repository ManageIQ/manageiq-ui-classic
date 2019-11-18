class ApplicationHelper::Button::Basic < Hash
  include ActionView::Helpers::TextHelper

  delegate :role_allows?, :parse_nodetype_and_id, :to => :@view_context

  def initialize(view_context, view_binding, instance_data, props)
    @view_context  = view_context
    @view_binding  = view_binding

    merge!(props)

    instance_data.each do |name, value|
      instance_variable_set(:"@#{name}", value)
    end
  end

  def data(input)
    input
  end

  def role_allows_feature?
    # for select buttons RBAC is checked only for nested buttons
    return true if self[:type] == :buttonSelect
    # for each button in select checks RBAC, self[:child_id] represents the
    # button id for buttons inside select
    return role_allows?(:feature => self[:child_id]) if self[:child_id]
    # check RBAC on separate button
    role_allows?(:feature => self[:id])
  end

  # Return content under key such as :text or :confirm run through gettext or
  # evalated in the context of controller variables and helper methods.
  def localized(key, value = nil)
    self[key] = value if value

    case self[key]
    when NilClass then ''
    when Proc     then instance_eval(&self[key])
    else               _(self[key])
    end
  end

  # Sets the attributes for the button:
  #   self[:enabled] -- displayed button is enabled
  #   self[:title]   -- button has the title on hover
  #   self[:prompt]  -- the user has to confirm the action
  #   self[:hidden]  -- the button is not displayed in the toolbar
  #   self[:text]    -- text for the button
  #   self[:onwhen]  -- enable button if items are selected
  #
  # If disabled? is true, disable onwhen and set state and title unless
  # user specifically enabled the button
  def calculate_properties
    enabled = !disabled?

    # if :enabled is not set, use disabled?
    self[:enabled] = enabled if self[:enabled].nil?

    # if disabled? is true and user did not specify that :enabled is true
    # then:
    #     set :onwhen to nil => do not enable when user select items
    #     set :title to error => show user the error message
    unless self[:enabled] || enabled
      self[:onwhen] = nil
      self[:title] = @error_message if @error_message.present?
    end
  end

  # Check if all instance variables for that button works with are set and
  # are not `nil`
  def all_instance_variables_set?
    self.class.instance_variables_required.to_a.all? do |instance_variable|
      !instance_variable_get(instance_variable.to_s).nil?
    end
  end
  private :all_instance_variables_set?

  def skipped?
    return true unless role_allows_feature?
    return true unless all_instance_variables_set?
    !visible?
  end

  # Tells whether the button should displayed in the toolbar or not
  def visible?
    true
  end

  # Tells whether the displayed button should be disabled or not
  def disabled?
    false
  end

  class << self
    attr_reader :instance_variables_required

    # Used to avoid rendering buttons dependent on instance variable if the
    # variable is not set
    def needs(*instance_variables)
      @instance_variables_required = instance_variables
    end
  end
end
