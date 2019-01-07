module ApplicationController::Filter::ExpressionEditorOptions
  extend ActiveSupport::Concern
  include ::MiqExpression::SubstMixin
  include ApplicationController::ExpressionHtml

  def type_for_option(option, operator)
    if operator.starts_with?('REG')
      :regexp
    else
      type = MiqExpression.get_col_info(option)[:format_sub_type]
      MiqExpression::FORMAT_SUB_TYPES.keys.include?(type) ? type : :string
    end
  end

  def expression_user_input(option, operator, next_options = [])
    { id: 'userinput', label: '', type: 'userinput', input_type: type_for_option(option, operator), next: next_options, parent: nil }
  end

  def exp_options
    binding.pry
    case params['next_options']
    when "field_root_options"
      render :json => field_root_options
    else
      render :json => root_options
    end
  end

  def exp_editor_root_options()
    first_level = [{ :id => 'fields', :label => 'Fields', :type => 'category', :next => {:url => 'exp_editor_field_root_options'}},
      { :id => 'tags', :label => 'Tags', :type => 'category', :next => {:url => 'exp_editor_tag_root_options' }},
      { :id => 'counts', :label => 'Count of', :type => 'category', :next => {:url => 'exp_editor_counts_root_options' }},
      { :id => 'find', :label => 'Find', :type => 'category', :next => {:url => 'exp_editor_find_root_options' }}]

    first_level
  end

  def exp_editor_field_root_options
    model = params['model']
    fields = MiqExpression.miq_adv_search_lists(model, :exp_available_fields)
    categories = fields.map {|a,b| [a.split(':').first, b.split('-').first]}.uniq
    categories.map! do |cat_label, cat_id|
      { :id => cat_id,
        :label => cat_label,
        :type => 'category',
        :next => fields.select{ |_label, id| id.split('-').first == cat_id}.map do |label, id|
          { :id => id.split('-').last,
            :label =>label.split(':').last,
            :type => 'category',
            :next => {:url => 'exp_editor_operators', :options => {:id => cat_id+id}}
           }
        end
      }
    end
    render :json => categories
  end

  def exp_editor_operators
    id = params['id']
    operators = MiqExpression.get_col_operators(id).map do |operator|
      n = ['IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY'].include?(operator) ? [] : [expression_user_input(id, operator)]
      {:id => operator, :label => operator, :type => 'operator', :next => n }
    end
    render :json => operators
  end

  def exp_editor_tag_root_options
    model = params['model']
    tags = MiqExpression.model_details(model, :typ => 'tag', :include_model => true, :include_my_tags => true, :userid => User.current_user.userid)
    tag_categories = tags.map {|a,b| [a.split(':').first, b.split('-').first]}.uniq
    tag_categories.map! do |cat_label, cat_id|
      { :id => cat_id,
        :label => cat_label,
        :type => 'category',
        :next => tags.select{ |_label, id| id.split('-').first == cat_id}.map do |label, id|
          { :id => id.split('-').last,
            :label =>label.split(':').last,
            :type => 'category',
            :next => {:url => 'exp_editor_tag_value_options', :options => {:id => cat_id+id}}
          }
        end
      }
    end
    render :json => tag_categories
  end

  def exp_editor_tag_value_options
    cat_id = params['id']
    tag_values = MiqExpression.get_entry_details(cat_id).sort_by  { |a| a.first.downcase }.map do |label, id|
      {:id => id, :label => label, :type => 'value', :next => [] }
    end
    render :json => tag_values
  end

  def exp_editor_counts_root_options
    model = params['model']
    counts = MiqExpression.miq_adv_search_lists(model, :exp_available_counts).map do |label, id|
      { :id => id,
        :label => label,
        :type => 'category',
        :next => {:url => 'exp_editor_count_operators'}
      }
    end
    render :json => counts
  end

  def exp_editor_count_operators
    count_operators = MiqExpression.get_col_operators(:count).map do |operator|
      {:id => operator, :label => operator, :type => 'operator', :next => [{ id: 'userinput', label: '', type: 'userinput', input_type: 'number', next: [], parent: nil }] }
    end
    render :json => count_operators
  end

  def exp_editor_find_root_options
    model = params['model']
    finds = MiqExpression.miq_adv_search_lists(model, :exp_available_finds)
    finds_categories = finds.map {|a,b| [a.split(':').first, b.split('-').first]}.uniq
    finds_table = finds_categories.map do |label, cat_id|
      { cat_id => finds.select{ |_label, id| id.split('-').first == cat_id }.map do |label, id|
          [label.split(':').last, id.split('-').last]
        end
      }
    end.reduce({}, :merge)


    finds_categories.map! do |cat_label, cat_id|
      { :id => cat_id,
        :label => cat_label,
        :type => 'category',
        :next => finds_table[cat_id].map do |label, id|
          { :id => id,
            :label => label,
            :type => 'category',
            :cat_id => cat_id,
            :next => {:url => 'exp_editor_find_operators', :options => {:id => id}}
          }
        end
      }
    end.reduce({}, :merge)
    # TODO FIX: returnded DATA FORMAT HERE
    render :json => finds_categories
  end

  def exp_editor_find_operators
    id = params['id']
    operators = MiqExpression.get_col_operators(id).sort_by { |a| a.first.downcase }.map do |operator|
      {:id => operator, :label => operator, :type => 'operator', :next => [expression_user_input(id, operator, {:url => 'exp_editor_find_check_nested_options'})] }
    end
    render :json => operators
  end

  def exp_editor_find_checks_options
    model = params['model']
    find_counts = { :id => 'checkcount',
      :label => _("Check Count"),
      :type => 'category',
      :next =>  count_operators
    }

    add_checks = ->(next_arr) do
      [[_("Check All"), "checkall"], [_("Check Any"), "checkany"]].map do |label, id|
        { :id => id,
          :label => label,
          :type => 'category',
          :next => find_check_nested_options()
        }
      end.push(find_counts)
    end
  end

  def exp_editor_find_check_nested_options
    model = params['model']
    finds = MiqExpression.miq_adv_search_lists(model, :exp_available_finds)
    finds_categories = finds.map {|a,b| [a.split(':').first, b.split('-').first]}.uniq
    finds_table = finds_categories.map do |label, cat_id|
      { cat_id => finds.select{ |_label, id| id.split('-').first == cat_id }.map do |label, id|
          [label.split(':').last, id.split('-').last]
        end
      }
    end.reduce({}, :merge)

    finds_categories.map! do |cat_label, cat_id|
      { :id => cat_id,
        :label => cat_label,
        :type => 'category',
        :next => finds_table[cat_id].map do |label, id|
          { :id => id,
            :label => label,
            :type => 'category',
            :cat_id => cat_id,
            :next => {:url => 'exp_editor_operators', :options => {:id => id}}
          }
        end
      }
    end.reduce({}, :merge)
    render :json => finds_categories
  end
end
