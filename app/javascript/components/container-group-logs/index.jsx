import React, { useState } from 'react';

const ContainerGroupLogs = ({ podId, podName, containers }) => {
    const [selectedContainer, setSelectedContainer] = useState(containers[0] || '');
    const [logs, setLogs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = () => {
        setLoading(true);
        setError(null);
        setLogs(null);

        fetch(`/container_group/logs/${podId}?container=${encodeURIComponent(selectedContainer)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setLogs(data.logs);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    return (
        <div>
            <h3>{ `Logs for ${podName}` }</h3>

            <select
                value={ selectedContainer }
                onChange={ (e) => setSelectedContainer(e.target.value) }
            >
                { containers.map((name) => (
                    <option key={ name } value={ name }>{ name }</option>
                )) }
            </select>

            <button onClick={ fetchLogs } disabled={ !selectedContainer } style={ { marginLeft: '10px' } }>
                View Logs
            </button>

            { loading && <p>Loading...</p> }
            { error && <p style={ { color: 'red' } }>{ error }</p> }

            { logs && (
                <pre style={ {
                    background: '#1e1e1e',
                    color: '#ddd',
                    padding: '10px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                } }>
                    { logs }
                </pre>
            ) }
        </div>
    );
};

export default ContainerGroupLogs;