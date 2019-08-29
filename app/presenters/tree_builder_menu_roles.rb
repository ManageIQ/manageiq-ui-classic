class TreeBuilderMenuRoles < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  attr_reader :rpt_menu, :role_choice

  def initialize(name, sandbox, build, **params)
    @rpt_menu    = params[:rpt_menu] || sandbox[:rpt_menu]
    @role_choice = params[:role_choice]

    super(name, sandbox, build)
  end

  # Used for testing convenience and to satisfy need for
  # tree data in controller

  def hash_tree
    @hash_tree ||= x_build_tree(@tree_state.x_tree(@name))
  end

  private

  def tree_init_options
    {:click_url => "/report/menu_editor/", :onclick => "miqOnClickMenuRoles"}
  end

  def root_options
    {
      :text    => t = _("Top Level"),
      :tooltip => t,
      :key     => "xx-b__Report Menus for #{role_choice}"
    }
  end

  # Typically another method will populate the children of a root object.
  # Since our data is an array of Strings or Arrays, we don't have ids to tie
  # parents to children. Therefore we include the children with the parent.
  # The :data key was chosen to avoid future conflicts with the :nodes key.
  #
  def x_get_tree_roots
    branches = menus.map do |i|
      grandkids = i.last.kind_of?(Array) ? i.last : []

      {
        :id      => "p__#{i.first}",
        :icon    => "pficon pficon-folder-close",
        :text    => i.first,
        :tooltip => i.first,
        :data    => grandkids
      }
    end

    count_only_or_objects(false, branches)
  end

  # Referenced by has_kids_for, builds nodes from branch kids and grandkids
  #
  def x_get_tree_hash_kids(parent, count_only = false)
    items = parent[:data].map do |child|
      if child.last.kind_of?(Array)
        build_middle_child(parent[:text], child)
      else
        build_last_child(child)
      end
    end

    count_only_or_objects(count_only, items)
  end

  def build_middle_child(parent_name, item)
    {
      :id      => "s__#{parent_name}:#{item.first}",
      :icon    => "pficon pficon-folder-close",
      :text    => item.first,
      :tooltip => item.first,
      :data    => item.last
    }
  end

  def build_last_child(child)
    {
      :id         => child,
      :icon       => "fa fa-file-text-o",
      :text       => child,
      :tooltip    => child,
      :selectable => false,
      :data       => []
    }
  end

  # Translated code from old controller method
  # builds the array we use in x_get_tree_roots
  # -- @hayesr Nov 2016

  # create/modify new array that doesn't have custom reports folder, dont need custom folder in menu_editor
  # add any new empty folders that were added
  def menus
    rpt_menu.map { |item| item if conforming_item?(item) }.compact
  end

  # Checks array pairs for empty children
  def conforming_item?(item)
    present_and_empty?(item[1]) ||
      present_not_empty_but_first_empty?(item[1]) ||
      present_not_empty_and_not_custom?(item[1])
  end

  def present_and_empty?(item)
    item&.empty?
  end

  def present_not_empty_but_first_empty?(item)
    item.present? && item[0].empty?
  end

  # Check the second level menu for "Custom"
  def present_not_empty_and_not_custom?(item)
    item.present? && !item[0].empty? && item[0][0] != "Custom"
  end
end
