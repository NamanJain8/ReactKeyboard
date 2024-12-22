import React, { useRef, useEffect, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import 'prosemirror-view/style/prosemirror.css'; // Import ProseMirror styles
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css'; // Import simple-keyboard styles

const App = () => {
  const editorRef = useRef();
  const viewRef = useRef();
  const keyboardRef = useRef();

  useEffect(() => {
    const handleKeydown = (event) => {
      event.preventDefault();
    };

    // Add the event listener to the window object
    window.addEventListener('keydown', handleKeydown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  
  useEffect(() => {
    // Create an initial document
    const contentElement = document.createElement('div');
    contentElement.innerHTML = '<p>Hello, ProseMirror!</p>';

    // Initialize the editor state
    const state = EditorState.create({
      doc: DOMParser.fromSchema(basicSchema).parse(contentElement),
      schema: basicSchema,
      plugins: [
        history(),
        keymap(baseKeymap),
        keymap({
          'Mod-b': toggleMark(basicSchema.marks.strong),
          'Mod-i': toggleMark(basicSchema.marks.em),
          'Mod-z': undo,
          'Mod-y': redo
        })
      ]
    });

    // Create the editor view
    const view = new EditorView(editorRef.current, {
      state
    });

    viewRef.current = view; // Store the view in a ref for later use

    // Initialize the virtual keyboard
    keyboardRef.current = new Keyboard({
      onChange: input => onChange(input),
      layout: hindiLayout
    });

    // Cleanup function to destroy the editor view and keyboard
    return () => {
      view.destroy();
    };
  }, []);

  const onChange = input => {
    const view = viewRef.current;
    const { state, dispatch } = view;

    // Get the current selection
    const { from, to } = state.selection;
    console.log(input, state)

    // Create a transaction to insert the input text
    const transaction = state.tr.insertText(input, from, to);

    // Apply the transaction to the editor state
    dispatch(transaction);

    // Set focus to the editor
    view.focus();
  };

  const applyCommand = (command) => {
    const view = viewRef.current;
    if (command(view.state, view.dispatch)) {
      view.focus();
    }
  };

  const hindiLayout = {
    default: [
      '१ २ ३ ४ ५ ६ ७ ८ ९ ० -',
      'क ख ग घ ङ च छ ज झ ञ',
      'ट ठ ड ढ ण त थ द ध न',
      'प फ ब भ म य र ल व श ष स ह',
      '़ ो ौ ं ः ु ू ृ े ै ो ौ ि ी ॅ ी ्'
    ]
  };

  return (
    <div className="App">
      <h1>ProseMirror Editor</h1>
      <div className="toolbar">
        <button onClick={() => applyCommand(toggleMark(basicSchema.marks.strong))}>
          Bold
        </button>
        <button onClick={() => applyCommand(toggleMark(basicSchema.marks.em))}>
          Italic
        </button>
        <button onClick={() => applyCommand(undo)}>Undo</button>
        <button onClick={() => applyCommand(redo)}>Redo</button>
      </div>
      <div ref={editorRef} id="editor"></div>
      <div id="keyboard" className="simple-keyboard"></div>
    </div>
  );
};

export default App;