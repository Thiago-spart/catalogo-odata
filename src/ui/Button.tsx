import { createLink, type LinkComponent } from '@tanstack/react-router';
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';
export const variants = {
  primary: `${base} bg-mangrove text-on-mangrove hover:bg-[#184a33]`,
  secondary: `${base} border border-line-strong bg-raised text-ink hover:bg-ground`,
};
type Variant = keyof typeof variants;

export function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${variants[variant]} ${className}`} {...props} />;
}

const Anchor = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }>(
  ({ variant = 'secondary', className = '', ...props }, ref) => (
    <a ref={ref} className={`${variants[variant]} ${className}`} {...props} />
  ),
);
Anchor.displayName = 'ButtonAnchor';

const CreatedLink = createLink(Anchor);
export const ButtonLink: LinkComponent<typeof Anchor> = (props) => <CreatedLink preload="intent" {...props} />;
