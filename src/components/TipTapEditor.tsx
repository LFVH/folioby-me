'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import { TextStyle } from '@tiptap/extension-text-style';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  editable?: boolean;
}

// Array de tamanhos de fonte disponíveis
const FONT_SIZES = [
  '12px',
  '14px', 
  '16px',
  '18px',
  '20px',
  '24px',
  '30px',
  '36px',
  '48px',
  '60px',
  '72px'
];

// Array de famílias de fonte disponíveis
const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Impact'
];

export default function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Vamos usar nosso próprio controle de tamanho
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'I am a...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  // Funções de formatação
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  
  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  const setFontFamily = (font: string) => {
    editor.chain().focus().setFontFamily(font).run();
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  return (
    <div className="tiptap-editor">
      {editable && (
        <div className="toolbar">
          {/* Controles de fonte */}
          <div className="toolbar-group">
            <select 
              onChange={(e) => setFontFamily(e.target.value)}
              value={editor.getAttributes('textStyle').fontFamily || 'Arial'}
              className="font-family-select"
              title="Fonte"
            >
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            
            <select 
              onChange={(e) => setFontSize(e.target.value)}
              value={editor.getAttributes('textStyle').fontSize || '16px'}
              className="font-size-select"
              title="Tamanho da fonte"
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Botões de formatação */}
          <div className="toolbar-group">
            <button
              onClick={toggleBold}
              className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
              title="Negrito (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            
            <button
              onClick={toggleItalic}
              className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
              title="Itálico (Ctrl+I)"
            >
              <em>I</em>
            </button>
            
            <button
              onClick={toggleUnderline}
              className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
              title="Sublinhado (Ctrl+U)"
            >
              <u>U</u>
            </button>
          </div>

          {/* Botão limpar formatação */}
          <div className="toolbar-group">
            <button
              onClick={clearFormatting}
              className="toolbar-button"
              title="Limpar formatação"
            >
              <span className="clear-format">↺</span>
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .tiptap-editor {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .toolbar-group {
          display: flex;
          gap: 0.25rem;
          padding: 0 0.5rem;
          border-right: 1px solid #cbd5e1;
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .font-family-select,
        .font-size-select {
          padding: 0.375rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 0.875rem;
          cursor: pointer;
          outline: none;
        }

        .font-family-select:hover,
        .font-size-select:hover {
          border-color: #3b82f6;
        }

        .font-family-select {
          min-width: 140px;
        }

        .font-size-select {
          min-width: 80px;
        }

        .toolbar-button {
          padding: 0.375rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 1rem;
          cursor: pointer;
          min-width: 36px;
          transition: all 0.2s;
        }

        .toolbar-button:hover {
          background-color: #e2e8f0;
          border-color: #94a3b8;
        }

        .toolbar-button.is-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .clear-format {
          font-size: 1.25rem;
          line-height: 1;
        }

        .tiptap-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
      `}</style>
      
      <EditorContent editor={editor} />
    </div>
  );
}