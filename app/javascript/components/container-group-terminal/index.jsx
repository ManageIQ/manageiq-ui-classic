import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const ContainerGroupTerminal = ({ podId }) => {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        term.focus();
        term.writeln('Connecting...');
        termRef.current = term;

        term.onData((data) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(data);
            }
        });

        return () => {
            term.dispose();
            wsRef.current?.close();
        };
    }, []);

    const connect = (connectionParams) => {
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${proto}://${window.location.host}/${connectionParams.url}`);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        ws.onopen = () => {
            termRef.current.writeln('Connected.');
            termRef.current.focus();
        };

        ws.onmessage = (evt) => {
            if (evt.data instanceof ArrayBuffer) {
                termRef.current.write(new Uint8Array(evt.data));
            } else if (evt.data instanceof Blob) {
                evt.data.arrayBuffer().then((buf) => termRef.current.write(new Uint8Array(buf)));
            } else if (typeof evt.data === 'string') {
                termRef.current.write(evt.data);
            }
        };

        ws.onerror = () => termRef.current.writeln('\r\n[connection error]');
        ws.onclose = () => termRef.current.writeln('\r\n[closed]');
    };

    const pollTask = (taskId) => {
        fetch(`/container_group/kube_exec_console/${podId}?task_id=${taskId}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.url) {
                    connect(data);
                } else if (data.error) {
                    termRef.current.writeln(`\r\n[error] ${data.error}`);
                } else {
                    setTimeout(() => pollTask(taskId), 1000);
                }
            });
    };

    useEffect(() => {
        fetch(`/container_group/kube_exec_console/${podId}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => pollTask(data.task_id));
    }, []);

    return (
        <div
            ref={ terminalRef }
            style={ { height: '500px' } }
            onClick={ () => termRef.current?.focus() }
        />
    );
};

export default ContainerGroupTerminal;