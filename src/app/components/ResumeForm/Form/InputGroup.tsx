import { useState, useEffect, useRef, type MutableRefObject } from "react";
import ContentEditable from "react-contenteditable";
import { useAutosizeTextareaHeight } from "lib/hooks/useAutosizeTextareaHeight";
import {
  getBulletListStringsFromHTML,
  getHTMLFromBulletListStrings,
  normalizeBulletListStrings,
} from "lib/bullet-list-rich-text";

interface InputProps<K extends string, V extends string | string[]> {
  label: string;
  labelClassName?: string;
  // name is passed in as a const string. Therefore, we make it a generic type so its type can
  // be more restricted as a const for the first argument in onChange
  name: K;
  value?: V;
  placeholder: string;
  onChange: (name: K, value: V) => void;
}

/**
 * InputGroupWrapper wraps a label element around a input children. This is preferable
 * than having input as a sibling since it makes clicking label auto focus input children
 */
export const InputGroupWrapper = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <label className={`text-[13px] font-medium text-slate-700 ${className}`}>
    {label}
    {children}
  </label>
);

export const INPUT_CLASS_NAME =
  "mt-1 block w-full rounded-sm border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-normal leading-6 text-slate-900 outline-none transition focus:border-slate-500";

export const Input = <K extends string>({
  name,
  value = "",
  placeholder,
  onChange,
  label,
  labelClassName,
}: InputProps<K, string>) => {
  return (
    <InputGroupWrapper label={label} className={labelClassName}>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={INPUT_CLASS_NAME}
      />
    </InputGroupWrapper>
  );
};

export const Textarea = <T extends string>({
  label,
  labelClassName: wrapperClassName,
  name,
  value = "",
  placeholder,
  onChange,
}: InputProps<T, string>) => {
  const textareaRef = useAutosizeTextareaHeight({ value });

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <textarea
        ref={textareaRef}
        name={name}
        className={`${INPUT_CLASS_NAME} resize-none overflow-hidden`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </InputGroupWrapper>
  );
};

export const BulletListTextarea = <T extends string>(
  props: InputProps<T, string[]> & { showBulletPoints?: boolean }
) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const isFirefox = navigator.userAgent.includes("Firefox");
    const isSafari =
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome"); // Note that Chrome also includes Safari in its userAgent
    if (isFirefox || isSafari) {
      setShowFallback(true);
    }
  }, []);

  if (showFallback) {
    return <BulletListTextareaFallback {...props} />;
  }
  return <BulletListTextareaGeneral {...props} />;
};

/**
 * BulletListTextareaGeneral is a textarea where each new line starts with a bullet point.
 *
 * In its core, it uses a div with contentEditable set to True. However, when
 * contentEditable is True, user can paste in any arbitrary html and it would
 * render. So to make it behaves like a textarea, it strips down all html while
 * keeping only the text part.
 *
 * Reference: https://stackoverflow.com/a/74998090/7699841
 */
const BulletListTextareaGeneral = <T extends string>({
  label,
  labelClassName: wrapperClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
}: InputProps<T, string[]> & { showBulletPoints?: boolean }) => {
  const externalHtml = getHTMLFromBulletListStrings(bulletListStrings);
  const [html, setHtml] = useState(externalHtml);
  const isFocusedRef = useRef(false);
  const lastBulletListStringsRef = useRef(bulletListStrings);
  const undoStackRef = useRef<string[][]>([]);
  const redoStackRef = useRef<string[][]>([]);

  useEffect(() => {
    if (
      !areBulletListStringsEqual(
        bulletListStrings,
        lastBulletListStringsRef.current
      )
    ) {
      lastBulletListStringsRef.current = bulletListStrings;
      undoStackRef.current = [];
      redoStackRef.current = [];
    }

    if (!isFocusedRef.current && html !== externalHtml) {
      setHtml(externalHtml);
    }
  }, [bulletListStrings, externalHtml, html]);

  const handleHTMLChange = (innerHTML: string) => {
    const newBulletListStrings = getBulletListStringsFromHTML(innerHTML);

    if (
      !areBulletListStringsEqual(
        newBulletListStrings,
        lastBulletListStringsRef.current
      )
    ) {
      undoStackRef.current.push(lastBulletListStringsRef.current);
      if (undoStackRef.current.length > MAX_UNDO_STACK_SIZE) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];
      lastBulletListStringsRef.current = newBulletListStrings;
      onChange(name, newBulletListStrings);
    }

    setHtml(innerHTML);
  };

  const restoreBulletListStrings = (
    nextBulletListStrings: string[],
    historyStack: MutableRefObject<string[][]>
  ) => {
    historyStack.current.push(lastBulletListStringsRef.current);
    lastBulletListStringsRef.current = nextBulletListStrings;
    setHtml(getHTMLFromBulletListStrings(nextBulletListStrings));
    onChange(name, nextBulletListStrings);
  };

  return (
    <InputGroupWrapper label={label} className={wrapperClassName}>
      <ContentEditable
        contentEditable={true}
        className={`${INPUT_CLASS_NAME} cursor-text [&>div]:list-item ${
          showBulletPoints ? "pl-7" : "[&>div]:list-['']"
        }`}
        // Note: placeholder currently doesn't work
        placeholder={placeholder}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={(e) => {
          isFocusedRef.current = false;
          const newBulletListStrings = getBulletListStringsFromHTML(
            e.currentTarget.innerHTML
          );
          setHtml(getHTMLFromBulletListStrings(newBulletListStrings));
          onChange(name, newBulletListStrings);
        }}
        onKeyDown={(e) => {
          const isUndoShortcut =
            (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z";
          const isRedoShortcut =
            ((e.metaKey || e.ctrlKey) &&
              e.shiftKey &&
              e.key.toLowerCase() === "z") ||
            (e.ctrlKey && e.key.toLowerCase() === "y");

          if (isUndoShortcut || isRedoShortcut) {
            e.preventDefault();
            const sourceStack = isRedoShortcut ? redoStackRef : undoStackRef;
            const targetStack = isRedoShortcut ? undoStackRef : redoStackRef;
            const previousBulletListStrings = sourceStack.current.pop();

            if (previousBulletListStrings) {
              restoreBulletListStrings(previousBulletListStrings, targetStack);
            }
            return;
          }

          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            document.execCommand("bold");
          }
        }}
        onChange={(e) => {
          if (e.type === "input") {
            const innerHTML =
              "value" in e.target && typeof e.target.value === "string"
                ? e.target.value
                : (e.currentTarget as HTMLDivElement).innerHTML;
            handleHTMLChange(innerHTML);
          }
        }}
        html={html}
      />
    </InputGroupWrapper>
  );
};

const MAX_UNDO_STACK_SIZE = 100;

const areBulletListStringsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, idx) => value === b[idx]);

const NORMALIZED_LINE_BREAK = "\n";
/**
 * Normalize line breaks to be \n since different OS uses different line break
 *    Windows -> \r\n (CRLF)
 *    Unix    -> \n (LF)
 *    Mac     -> \n (LF), or \r (CR) for earlier versions
 */
const normalizeLineBreak = (str: string) =>
  str.replace(/\r?\n/g, NORMALIZED_LINE_BREAK);
const dedupeLineBreak = (str: string) =>
  str.replace(/\n\n/g, NORMALIZED_LINE_BREAK);
const getStringsByLineBreak = (str: string) => str.split(NORMALIZED_LINE_BREAK);

/**
 * BulletListTextareaFallback is a fallback for BulletListTextareaGeneral to work around
 * content editable div issue in some browsers. For example, in Firefox, if user enters
 * space in the content editable div at the end of line, Firefox returns it as a new
 * line character \n instead of space in innerText.
 */
const BulletListTextareaFallback = <T extends string>({
  label,
  labelClassName,
  name,
  value: bulletListStrings = [],
  placeholder,
  onChange,
  showBulletPoints = true,
}: InputProps<T, string[]> & { showBulletPoints?: boolean }) => {
  const textareaValue = getTextareaValueFromBulletListStrings(
    bulletListStrings,
    showBulletPoints
  );

  return (
    <Textarea
      label={label}
      labelClassName={labelClassName}
      name={name}
      value={textareaValue}
      placeholder={placeholder}
      onChange={(name, value) => {
        onChange(
          name,
          getBulletListStringsFromTextareaValue(value, showBulletPoints)
        );
      }}
    />
  );
};

const getTextareaValueFromBulletListStrings = (
  bulletListStrings: string[],
  showBulletPoints: boolean
) => {
  const prefix = showBulletPoints ? "• " : "";

  if (bulletListStrings.length === 0) {
    return "";
  }

  let value = "";
  for (let i = 0; i < bulletListStrings.length; i++) {
    const string = bulletListStrings[i];
    const isLastItem = i === bulletListStrings.length - 1;
    value += `${prefix}${string}${isLastItem ? "" : "\r\n"}`;
  }
  return value;
};

const getBulletListStringsFromTextareaValue = (
  textareaValue: string,
  showBulletPoints: boolean
) => {
  const textareaValueWithNormalizedLineBreak =
    normalizeLineBreak(textareaValue);

  const strings = getStringsByLineBreak(textareaValueWithNormalizedLineBreak);

  if (showBulletPoints) {
    // Filter out empty strings
    const nonEmptyStrings = strings.filter((s) => s !== "•");

    let newStrings: string[] = [];
    for (let string of nonEmptyStrings) {
      if (string.startsWith("• ")) {
        newStrings.push(string.slice(2));
      } else if (string.startsWith("•")) {
        // Handle the special case when user wants to delete the bullet point, in which case
        // we combine it with the previous line if previous line exists
        const lastItemIdx = newStrings.length - 1;
        if (lastItemIdx >= 0) {
          const lastItem = newStrings[lastItemIdx];
          newStrings[lastItemIdx] = `${lastItem}${string.slice(1)}`;
        } else {
          newStrings.push(string.slice(1));
        }
      } else {
        newStrings.push(string);
      }
    }
    return normalizeBulletListStrings(newStrings);
  }

  return normalizeBulletListStrings(strings);
};
