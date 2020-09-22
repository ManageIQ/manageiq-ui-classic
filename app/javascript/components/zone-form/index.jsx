import React from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './zone-form.schema';

const ZoneForm = () => {

    return (
        <MiqFormRenderer
            schema={createSchema()}
            onSubmit={console.log}
            onCancel={console.log}
        />
    );         
};

export default ZoneForm;
