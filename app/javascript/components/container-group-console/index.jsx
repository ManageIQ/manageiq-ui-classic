import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const ContainerGroupConsole = ({ podId, containers: initialContainers = [] }) => {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const wsRef = useRef(null);
    const pollTimerRef = useRef(null);

    const [containers] = useState(initialContainers.map((name) => ({ name })));
    const [selectedContainer, setSelectedContainer] = useState(
        initialContainers.length === 1 ? initialContainers[0] : ''
    );
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const term = new Terminal({ cursorBlink: true });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        term.focus();
        term.writeln('Select a container and click Connect.');
        termRef.current = term;

        term.onData((data) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(data);
            }
        });

        return () => {
            closeConsole();
            term.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tears down any active session (websocket + pending poll) without
    // touching which container is selected in the dropdown.
    const closeConsole = () => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        if (wsRef.current) {
            // Prevent the old socket's onclose handler from writing a stray
            // "[closed]" line after we've already started a new session.
            wsRef.current.onclose = null;
            wsRef.current.onerror = null;
            wsRef.current.onmessage = null;
            wsRef.current.close();
            wsRef.current = null;
        }
        setConnected(false);
        setConnecting(false);
    };

    const connect = (connectionParams, containerName) => {
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${proto}://${window.location.host}/${connectionParams.url}`);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        ws.onopen = () => {
            termRef.current.clear();
            termRef.current.writeln(`Connected to ${containerName}`);
            termRef.current.focus();
            setConnecting(false);
            setConnected(true);
        };

        ws.onmessage = (evt) => {
            if (evt.data instanceof ArrayBuffer) {
                termRef.current.write(new Uint8Array(evt.data));
            } else if (evt.data instanceof Blob) {
                evt.data.arrayBuffer().then((buf) => termRef.current.write(new Uint8Array(buf)));
            } else {
                termRef.current.write(evt.data);
            }
        };

        ws.onerror = () => {
            termRef.current.writeln('\r\n[connection error]');
            setConnecting(false);
            setConnected(false);
        };

        ws.onclose = () => {
            termRef.current.writeln('\r\n[closed]');
            setConnecting(false);
            setConnected(false);
        };
    };

    const pollTask = (taskId, containerName) => {
        fetch(`/container_group/kube_exec_console/${podId}?task_id=${taskId}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.url) {
                    connect(data, containerName);
                } else if (data.error) {
                    termRef.current.writeln(`\r\n[error] ${data.error}`);
                    setConnecting(false);
                } else {
                    pollTimerRef.current = setTimeout(() => pollTask(taskId, containerName), 1000);
                }
            });
    };

    const startConsole = () => {
        if (!selectedContainer) return;

        // Switching containers (or reconnecting) — tear down whatever's active first.
        closeConsole();

        setConnecting(true);
        termRef.current.clear();
        termRef.current.writeln(`Connecting to ${selectedContainer}...`);

        fetch(
            `/container_group/kube_exec_console/${podId}?container=${encodeURIComponent(selectedContainer)}`,
            { headers: { Accept: 'application/json' } }
        )
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    termRef.current.writeln(data.error);
                    setConnecting(false);
                } else {
                    pollTask(data.task_id, selectedContainer);
                }
            });
    };

    useEffect(() => {
        if (containers.length === 1 && selectedContainer) {
            startConsole();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            { containers.length > 1 && (
                <div style={ { marginBottom: '15px' } }>
                    <label htmlFor="container-select">Container:&nbsp;</label>
                    <select
                        id="container-select"
                        value={ selectedContainer }
                        onChange={ (e) => setSelectedContainer(e.target.value) }
                        disabled={ connecting }
                    >
                        <option value="">Select Container</option>
                        { containers.map((container) => (
                            <option key={ container.name } value={ container.name }>
                                { container.name }
                            </option>
                        )) }
                    </select>
                    <button
                        style={ { marginLeft: '10px' } }
                        onClick={ startConsole }
                        disabled={ !selectedContainer || connecting }
                    >
                        { connected ? 'Reconnect' : 'Connect' }
                    </button>
                    <button
                        style={ { marginLeft: '10px' } }
                        onClick={ closeConsole }
                        disabled={ !connected && !connecting }
                    >
                        Close
                    </button>
                </div>
            ) }

            <div
                ref={ terminalRef }
                style={ { height: '500px', border: '1px solid #ccc' } }
                onClick={ () => termRef.current?.focus() }
            />
        </>
    );
};

export default ContainerGroupConsole;