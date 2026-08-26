import { useFieldApi } from '@@ddf';
import { Checkbox } from '@carbon/react';

const CATEGORY_CHOICES = {
  system: __('System'),
  services: __('Services'),
  software: __('Software'),
  accounts: __('User Accounts'),
  vmconfig: __('VM Configuration'),
};

const CategoryTab = (props) => {
  const {
    input: { value = {}, onChange },
  } = useFieldApi(props);

  const handleCategoryChange = (categoryKey, checked) => {
    const newCategory = { ...value };
    if (checked) {
      newCategory[categoryKey] = true;
    } else {
      delete newCategory[categoryKey];
    }
    onChange(newCategory);
  };

  return (
    <div className="ap-form-category">
      <h3>{__('Category Selection')}</h3>
      <div className="form-horizontal">
        <div className="form-group">
          <div className="col-md-8">
            <div className="row">
              {Object.entries(CATEGORY_CHOICES).map(([key, label]) => (
                <div key={key} className="col-md-4 ap-form-category__item">
                  <Checkbox
                    id={`check_${key}`}
                    labelText={label}
                    checked={!!value[key]}
                    onChange={(e) => handleCategoryChange(key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTab;
