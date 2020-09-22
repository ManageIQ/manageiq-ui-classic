import React, { useEffect, useState } from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './zone-form.schema';

const ZoneForm = ({recordId}) => {
    const [initialValues, setInitialValues] = useState([]);
    console.log(recordId);

    useEffect(() => {
        if (recordId) {
            API.get(`/api/zones/${recordId}`).then((res)=> {
                console.log(res);
                setInitialValues(res);
            });
        }
    }, []);

    return (
        <MiqFormRenderer
            initialValues={initialValues}
            schema={createSchema()}
            onSubmit={console.log}
            onCancel={console.log}
        />
    );         
};

export default ZoneForm;
