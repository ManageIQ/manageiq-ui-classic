import React, { useEffect, useState } from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './zone-form.schema';

const ZoneForm = ({recordId}) => {

    const [{initialValues, isLoading}, setState] = useState({ isLoading: !!recordId });

    useEffect(() => {
        if (recordId) {
            API.get(`/api/zones/${recordId}`).then((res)=> {
                console.log(res);
                setState({
                    initialValues: res,
                    isLoading: false
                });
            });
        }
    }, []);

    return !isLoading && (
        <MiqFormRenderer
            initialValues={initialValues}
            schema={createSchema()}
            onSubmit={console.log}
            onCancel={console.log}
        />
    );         
};

export default ZoneForm;
