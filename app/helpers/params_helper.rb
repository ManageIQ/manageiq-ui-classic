module ParamsHelper
  def copy_param_if_set(target, source, key)
    target[key] = source[key] if source[key]
  end

  def copy_params_if_set(target, source, list)
    list.each do |key|
      copy_param_if_set(target, source, key)
    end
    target
  end
end
