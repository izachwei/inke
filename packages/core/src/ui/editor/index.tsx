"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { defaultEditorProps } from "./props";
import { defaultExtensions } from "./extensions";
import useLocalStorage from "@/lib/hooks/use-local-storage";
import { useDebouncedCallback } from "use-debounce";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import va from "@vercel/analytics";
import { defaultEditorContent } from "./default-content";
import { EditorBubbleMenu } from "./bubble-menu";
import { getPrevText } from "@/lib/editor";
import { ImageResizer } from "./extensions/image-resizer";
import { EditorProps } from "@tiptap/pm/view";
import { Editor as EditorClass, Extensions } from "@tiptap/core";
import { NovelContext } from "./provider";
import "./styles.css";
import { PauseCircle } from "lucide-react";
import { Magic } from "../icons";

export default function Editor({
  completionApi = "/api/generate",
  className = "novel-relative novel-min-h-[500px] novel-w-full novel-max-w-screen-lg novel-border-stone-200 novel-bg-white sm:novel-mb-[calc(20vh)] sm:novel-rounded-lg sm:novel-border sm:novel-shadow-lg",
  defaultValue = defaultEditorContent,
  extensions = [],
  editorProps = {},
  onUpdate = () => {},
  onDebouncedUpdate = () => {},
  debounceDuration = 750,
  storageKey = "novel__content",
  disableLocalStorage = false,
  editable = true,
  plan = "5",
}: {
  /**
   * The API route to use for the OpenAI completion API.
   * Defaults to "/api/generate".
   */
  completionApi?: string;
  /**
   * Additional classes to add to the editor container.
   * Defaults to "relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg".
   */
  className?: string;
  /**
   * The default value to use for the editor.
   * Defaults to defaultEditorContent.
   */
  defaultValue?: JSONContent | string;
  /**
   * A list of extensions to use for the editor, in addition to the default inke extensions.
   * Defaults to [].
   */
  extensions?: Extensions;
  /**
   * Props to pass to the underlying Tiptap editor, in addition to the default inke editor props.
   * Defaults to {}.
   */
  editorProps?: EditorProps;
  /**
   * A callback function that is called whenever the editor is updated.
   * Defaults to () => {}.
   */
  // eslint-disable-next-line no-unused-vars
  onUpdate?: (editor?: EditorClass) => void;
  /**
   * A callback function that is called whenever the editor is updated, but only after the defined debounce duration.
   * Defaults to () => {}.
   */
  // eslint-disable-next-line no-unused-vars
  onDebouncedUpdate?: (
    json: JSONContent,
    text: string,
    markdown: string,
    editor: EditorClass
  ) => void;
  /**
   * The duration (in milliseconds) to debounce the onDebouncedUpdate callback.
   * Defaults to 750.
   */
  debounceDuration?: number;
  /**
   * The key to use for storing the editor's value in local storage.
   * Defaults to "novel__content".
   */
  storageKey?: string;
  /**
   * Disable local storage read/save.
   * Defaults to false.
   */
  disableLocalStorage?: boolean;
  /**
   * Enable editing.
   * Defaults to true.
   */
  editable?: boolean;
  plan?: string;
}) {
  const [content, setContent] = useLocalStorage(storageKey, defaultValue);

  const [hydrated, setHydrated] = useState(false);

  const [isLoadingOutside, setLoadingOutside] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON();
    const text = editor.getText();
    const markdown = editor.storage.markdown.getMarkdown();

    onDebouncedUpdate(json, text, markdown, editor);

    if (!disableLocalStorage) {
      setContent(json);
    }
  }, debounceDuration);

  const editor = useEditor({
    extensions: [...defaultExtensions, ...extensions],
    editorProps: {
      ...defaultEditorProps,
      ...editorProps,
    },
    editable: editable,
    onUpdate: (e) => {
      const selection = e.editor.state.selection;
      const lastTwo = getPrevText(e.editor, {
        chars: 2,
      });
      if (lastTwo === "??" && !isLoading) {
        setLoadingOutside(true);
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(
          getPrevText(e.editor, {
            chars: 5000,
          })
        );
        // complete(e.editor.storage.markdown.getMarkdown());
        va.track("Autocomplete Shortcut Used");
      } else {
        onUpdate(e.editor);
        debouncedUpdates(e);
      }
    },
    autofocus: false,
  });

  const { complete, completion, isLoading, stop } = useCompletion({
    id: "inke",
    api: completionApi,
    body: { plan },
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: (err) => {
      toast.error(err.message);
      if (err.message === "You have reached your request limit for the day.") {
        va.track("Rate Limit Reached");
      }
    },
  });

  const prev = useRef("");

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff);
    if (!isLoading) {
      setLoadingOutside(false);
    }
  }, [isLoading, editor, completion]);

  // Default: Hydrate the editor with the content from localStorage.
  // If disableLocalStorage is true, hydrate the editor with the defaultValue.
  useEffect(() => {
    if (!editor || hydrated) return;

    const value = disableLocalStorage ? defaultValue : content;

    if (value) {
      editor.commands.setContent(value);
      setHydrated(true);
    }
  }, [editor, defaultValue, content, hydrated, disableLocalStorage]);

  return (
    <NovelContext.Provider
      value={{
        completionApi,
        plan,
      }}>
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className={className}>
        {editor && <EditorBubbleMenu editor={editor} />}
        {editor?.isActive("image") && <ImageResizer editor={editor} />}
        <EditorContent editor={editor} />
        {isLoadingOutside && isLoading && (
          <div className="novel-fixed novel-bottom-3 novel-right-3">
            <div className="flex items-center justify-start novel-bg-white shadow-lg rounded-full px-3 py-2 w-16 h-10">
              <Magic className="novel-w-7 novel-animate-pulse" />
              <span className="text-sm novel-animate-pulse novel-ml-1 novel-text-slate-500">
                generating...
              </span>
              <PauseCircle
                onClick={stop}
                className="novel-h-5 hover:novel-text-stone-500 cursor-pointer novel-ml-6 novel-w-5 novel-text-stone-300"
              />
            </div>
          </div>
        )}
      </div>
    </NovelContext.Provider>
  );
}
