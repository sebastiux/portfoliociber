import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: (props) => (
            <h1 className="mt-8 text-2xl font-semibold tracking-tight" {...props} />
          ),
          h2: (props) => (
            <h2
              className="mt-8 text-lg font-semibold tracking-tight text-[color:var(--accent)]"
              {...props}
            />
          ),
          h3: (props) => (
            <h3 className="mt-6 text-base font-semibold tracking-tight" {...props} />
          ),
          p: (props) => <p className="mt-4 text-[color:var(--foreground)]" {...props} />,
          a: ({ href, ...rest }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--link)] underline decoration-dotted underline-offset-2"
              {...rest}
            />
          ),
          ul: (props) => <ul className="mt-3 list-disc space-y-1 pl-5" {...props} />,
          ol: (props) => <ol className="mt-3 list-decimal space-y-1 pl-5" {...props} />,
          li: (props) => <li className="text-[color:var(--foreground)]" {...props} />,
          code: ({ children, ...rest }) => (
            <code
              className="rounded-sm border border-[color:var(--border)] bg-[color:var(--panel)] px-1 py-0.5 font-mono text-[12px]"
              {...rest}
            >
              {children}
            </code>
          ),
          pre: (props) => (
            <pre
              className="mt-4 overflow-x-auto rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] p-3 font-mono text-xs"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="mt-4 border-l-2 border-[color:var(--accent)] pl-3 text-[color:var(--muted)]"
              {...props}
            />
          ),
          table: (props) => (
            <div className="mt-4 overflow-x-auto rounded border border-[color:var(--border)]">
              <table className="w-full text-left text-xs" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border-b border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[color:var(--muted)]"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border-t border-[color:var(--border)] px-3 py-2 align-top" {...props} />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
