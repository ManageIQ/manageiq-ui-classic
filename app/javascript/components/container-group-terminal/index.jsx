import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import ActionCable from 'actioncable';
import 'xterm/css/xterm.css';

const ContainerGroupTerminal = ({ podId, podName }) => {
    const terminalRef = useRef(null);
    const termRef = useRef(null);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln('Pod Terminal');
        term.writeln('Terminal initialized');
        termRef.current = term;
        
        term.onData((data) => {
            if (subscriptionRef.current) {
                subscriptionRef.current.perform('input', { data });
            }
        });

        return () => term.dispose();
    }, []);

    useEffect(() => {
        const cable = ActionCable.createConsumer('/ws/notifications');
        const subscription = cable.subscriptions.create(
            { channel: "PodTerminalChannel", pod_id: podId },
            {
                connected() {
                    console.log("CONNECTED TO POD CHANNEL");
                    fetch(`/container_group/terminal_start/${podId}`, { method: "POST" });
                },
                disconnected() { console.log("DISCONNECTED"); },
                rejected() { console.log("REJECTED"); },
                received(data) {
                    if (termRef.current) termRef.current.write(data.output);
                },
            }
        );
        subscriptionRef.current = subscription;
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetch(window.location.pathname.replace('/terminal/', '/terminal_ticket/'))
            .then((r) => r.json())
            .then((data) => {
                if (termRef.current) {
                    termRef.current.writeln(`Pod: ${data.pod}`);
                    termRef.current.writeln(`Namespace: ${data.namespace}`);
                    termRef.current.writeln(`Host: ${data.host}`);
                }
            });
    }, []);
    return <div ref={ terminalRef } style={ { height: '500px' } } />;
};

export default ContainerGroupTerminal;