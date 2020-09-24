import React, { useEffect, useState } from 'react';

import MiqFormRenderer from '@@ddf';
import createSchema from './zone-form.schema';
import miqRedirectBack from "../../helpers/miq-redirect-back";
import { http } from '../../http_api';

const ZoneForm = ({recordId}) => {
    const [{initialValues, isLoading}, setState] = useState({ isLoading: !!recordId });

    const cancelUrl = recordId ? `/ops/zone_edit/${recordId}?button=cancel` : '/ops/zone_edit/?button=cancel';

    const onSubmit = ({href, id, created_on, updated_on, actions, authentications, ...data}) => {
        miqSparkleOn();
        const message = __('Zone was saved');
        const submitUrl = recordId ? `/ops/zone_edit/?button=save&id=${recordId}&name=${data.name}` : `/ops/zone_edit/?button=add&name=${data.name}`;

        const request = recordId ? API.post(`/api/zones/${recordId}`, {action: "edit", resource: {...data, authentications: { authentications }}}) : 
        API.post('/api/zones', { authentications: { authentications }, ...data });
        request.then(() => miqAjaxButton(submitUrl)).catch(miqSparkleOff);
    };

    useEffect(() => {
        if (recordId) {
            API.get(`/api/zones/${recordId}?attributes=authentications`).then(({authentications, ...res})=> {
                console.log(res);
                setState({
                    initialValues: { 
                        ...res, 
                        authentications: authentications[0] 
                    },
                    isLoading: false
                });
            });
        }
    }, []);

    return !isLoading && (
        <MiqFormRenderer
            initialValues={initialValues}
            schema={createSchema(!!recordId)}
            onSubmit={onSubmit}
            onCancel={() => miqAjaxButton(cancelUrl)}
            buttonsLabels={{
                submitLabel: __('Save'),
                cancelLabel: __('Cancel'),
              }}
        />
    );         
};

export default ZoneForm;
