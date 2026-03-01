'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import { TextStyle } from '@tiptap/extension-text-style';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  editable?: boolean;
}

// Extensão personalizada para tamanho da fonte
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      FontSize,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'tiptap-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        validate: url => /^https?:\/\//.test(url),
      }),
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

  // Funções de link
  const openLinkModal = () => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      setLinkUrl(previousUrl || '');
      
      // Pega o texto selecionado para usar como texto do link
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      setLinkText(selectedText);
      
      setIsLinkModalOpen(true);
    }
  };

  const setLink = () => {
    if (!editor) return;

    if (linkUrl) {
      // Se há texto selecionado, aplica o link
      if (linkText && !editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl })
          .run();
      } else {
        // Se não há texto selecionado, insere um novo texto com link
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}" target="_blank">${linkText || linkUrl}</a>`)
          .run();
      }
    }

    closeLinkModal();
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
    closeLinkModal();
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Obter atributos atuais do texto selecionado
  const getCurrentFontFamily = () => {
    const { fontFamily } = editor.getAttributes('textStyle');
    return fontFamily || 'Arial';
  };

  const getCurrentFontSize = () => {
    const { fontSize } = editor.getAttributes('textStyle');
    return fontSize || '16px';
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {editable && (
        <>
          <div className="toolbar">
            {/* Controles de fonte */}
            <div className="toolbar-group">
              <select 
                onChange={(e) => setFontFamily(e.target.value)}
                value={getCurrentFontFamily()}
                className="font-family-select"
                title="Fonte"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              
              <select 
                onChange={(e) => setFontSize(e.target.value)}
                value={getCurrentFontSize()}
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

            {/* Botões de link */}
            <div className="toolbar-group">
              <button
                onClick={openLinkModal}
                className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`}
                title="Inserir link (Ctrl+K)"
              >
                🔗
              </button>
              
              {editor.isActive('link') && (
                <button
                  onClick={unsetLink}
                  className="toolbar-button"
                  title="Remover link"
                >
                  ✕
                </button>
              )}
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

          {/* Modal de link */}
          {isLinkModalOpen && (
            <div className="link-modal-overlay" onClick={closeLinkModal}>
              <div className="link-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Inserir Link</h3>
                
                <div className="link-modal-content">
                  <div className="link-modal-field">
                    <label htmlFor="link-text">Texto do link</label>
                    <input
                      id="link-text"
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Texto a ser exibido"
                      className="link-modal-input"
                    />
                  </div>
                  
                  <div className="link-modal-field">
                    <label htmlFor="link-url">URL</label>
                    <input
                      id="link-url"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://exemplo.com"
                      className="link-modal-input"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="link-modal-actions">
                  <button onClick={closeLinkModal} className="link-modal-button cancel">
                    Cancelar
                  </button>
                  <button onClick={setLink} className="link-modal-button confirm">
                    Inserir
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <style jsx global>{`
        .tiptap-editor {
          border: 1px solid #333;
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: #141414;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #1f1f1f;
          border-bottom: 1px solid #333;
        }

        .toolbar-group {
          display: flex;
          gap: 0.25rem;
          padding: 0 0.5rem;
          border-right: 1px solid #444;
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .font-family-select,
        .font-size-select {
          padding: 0.375rem 0.75rem;
          border: 1px solid #444;
          border-radius: 0.375rem;
          background-color: #2a2a2a;
          color: #fff;
          font-size: 0.875rem;
          cursor: pointer;
          outline: none;
        }

        .font-family-select:hover,
        .font-size-select:hover {
          border-color: #e50914;
        }

        .font-family-select option,
        .font-size-select option {
          background-color: #2a2a2a;
          color: #fff;
        }

        .font-family-select {
          min-width: 140px;
        }

        .font-size-select {
          min-width: 80px;
        }

        .toolbar-button {
          padding: 0.375rem 0.75rem;
          border: 1px solid #444;
          border-radius: 0.375rem;
          background-color: #2a2a2a;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          min-width: 36px;
          transition: all 0.2s;
        }

        .toolbar-button:hover {
          background-color: #404040;
          border-color: #e50914;
        }

        .toolbar-button.is-active {
          background-color: #e50914;
          border-color: #e50914;
          color: #fff;
        }

        .clear-format {
          font-size: 1.25rem;
          line-height: 1;
        }

        .tiptap-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
          color: #fff;
          background-color: #141414;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #666;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        /* Estilo para links */
        .tiptap-editor .ProseMirror .tiptap-link {
          color: #e50914;
          text-decoration: underline;
          cursor: pointer;
        }

        .tiptap-editor .ProseMirror .tiptap-link:hover {
          opacity: 0.8;
        }

        /* Estilo para texto selecionado */
        .tiptap-editor .ProseMirror ::selection {
          background-color: #e50914;
          color: #fff;
        }

        /* Modal de link */
        .link-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .link-modal {
          background-color: #1f1f1f;
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 400px;
          width: 90%;
          border: 1px solid #333;
        }

        .link-modal h3 {
          color: #fff;
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .link-modal-content {
          margin-bottom: 1.5rem;
        }

        .link-modal-field {
          margin-bottom: 1rem;
        }

        .link-modal-field label {
          display: block;
          color: #fff;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .link-modal-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #444;
          border-radius: 0.375rem;
          background-color: #2a2a2a;
          color: #fff;
          font-size: 0.875rem;
          outline: none;
        }

        .link-modal-input:focus {
          border-color: #e50914;
        }

        .link-modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .link-modal-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .link-modal-button.cancel {
          background-color: #2a2a2a;
          color: #fff;
          border: 1px solid #444;
        }

        .link-modal-button.cancel:hover {
          background-color: #404040;
        }

        .link-modal-button.confirm {
          background-color: #e50914;
          color: #fff;
        }

        .link-modal-button.confirm:hover {
          background-color: #f6121d;
        }
      `}</style>
      
      <EditorContent editor={editor} />
    </div>
  );
}