import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-text-tertiary">
      <div className="mx-auto max-w-6xl px-6">
        <p>
          &copy; 2026 FaceShapeAI
          <span className="mx-2">&middot;</span>
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            Privacy
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </p>
      </div>
    </footer>
  );
}
