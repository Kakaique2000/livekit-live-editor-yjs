import { useLivekitAwareness, useLivekitYJSDoc } from "@/integrations/LivekitYJSProvider/LivekitYJSProvider";
import { Editor } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from "react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness.js";
import * as Y from 'yjs';

const doc = new Y.Doc();
const awareness = new Awareness(doc);
const text = doc.getText("index-text");

export const SyncedBasicEditor = () => {


    useLivekitYJSDoc(doc, "synced-basic-text");
    useLivekitAwareness(awareness, "synced-basic-awareness");

    const bindingRef = useRef<MonacoBinding | null>(null);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        const monacoBinding = new MonacoBinding(text, editor.getModel()!, new Set([editor]), awareness)
        bindingRef.current = monacoBinding;
    }

    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
        }
    }, []);

    return (
        <div>
            <Editor
                onMount={handleEditorDidMount}
                height="100vh"
                theme="vs-dark"
                defaultLanguage="typescript" />
        </div>
    )
}