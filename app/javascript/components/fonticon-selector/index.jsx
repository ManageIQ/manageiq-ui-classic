import React, { useState, useEffect } from 'react';
import { componentTypes, validatorTypes, useFieldApi } from '@@ddf';
const FontIconSelector = props => {
    const { label, input, meta, ...rest } = useFieldApi(props);
    
    return (
      <div>
        <label htmlFor={input.value}>{label}</label>
        <input {...input} {...rest} id={input.name} />
      </div>
    );
  };
  
  export default FontIconSelector


  /**
   * if the input values are changed, then the save/reset button will be enabled directely.
   * if we disable this, the font-icon-picker's name must be edited in the schema file.
   */