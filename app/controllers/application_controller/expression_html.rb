module ApplicationController::ExpressionHtml
  # Build a string from an array of expression symbols by recursively traversing the MiqExpression object
  #   and inserting sequential tokens for each expression part

  def join_binary(exp, operation, color)
    ViewHelper.capture do
      ViewHelper.concat_tag(:font, :color => color) do
        ViewHelper.content_tag(:strong, '(')
      end

      exps = exp[operation].map do |e|
        ViewHelper.content_tag(:font, :color => calculate_font_color(e['result'])) do
          exp_str, = exp_build_string(e)
          exp['result'] && !e['result'] ? ViewHelper.content_tag(:i, exp_str) : exp_str
        end
      end

      glue = ViewHelper.content_tag(:font, :color => color) do
        ViewHelper.content_tag(:strong, " #{operation.upcase} ")
      end

      ViewHelper.concat ViewHelper.safe_join(exps, glue)

      ViewHelper.concat_tag(:font, :color => color) do
        ViewHelper.content_tag(:strong, ')')
      end
    end
  end

  def exp_build_string(exp)
    main_font = calculate_font_color(exp['result'])

    if exp['and']
      exp_string = join_binary(exp, 'and', main_font)
    elsif exp['or']
      exp_string = join_binary(exp, 'or', main_font)
    elsif exp['not']
      exp_string = ViewHelper.capture do
        ViewHelper.concat_tag(:font, :color => main_font) do
          ViewHelper.content_tag(:strong, ' NOT ')
        end

        unless %w(and or).include?(exp["not"].keys.first)
          ViewHelper.concat_tag(:font, :color => main_font) do
            ViewHelper.content_tag(:strong, '(')
          end
        end

        exp_str, = exp_build_string(exp["not"])
        ViewHelper.concat_tag(:font, :color => main_font) do
          exp['result'] && !e['result'] ? ViewHelper.content_tag(:i, exp_str) : exp_str
        end

        unless %w(and or).include?(exp["not"].keys.first)
          ViewHelper.concat_tag(:font, :color => main_font) do
            ViewHelper.content_tag(:strong, ')')
          end
        end
      end
    else
      temp_exp = copy_hash(exp)
      temp_exp.delete("result")
      exp_string = ViewHelper.content_tag(:font, :color => main_font) do
        MiqExpression.to_human(temp_exp)
      end
    end

    return exp_string, ActionController::Base.helpers.strip_tags(exp_string)
  end

  def calculate_font_color(result)
    fcolor = "black"
    if result == true
      fcolor = "green"
    elsif result == false
      fcolor = "red"
    end
    fcolor
  end
end
