import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';

const TagModifier = ({
  header = __('Add/Modify tag'),
  hideHeader = false,
  children,
}) => (
  <>
    { !hideHeader
      && (
        <Grid className="tag-modifier-header">
          <Column sm={4} md={8} lg={16}>
            <h4>{header}</h4>
          </Column>
        </Grid>
      ) }
    {/* div, not <Form>, to avoid nesting forms */}
    <div className="cds--form tag-modifier-form">{children}</div>
  </>
);

TagModifier.propTypes = {
  header: PropTypes.string,
  hideHeader: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export default TagModifier;
