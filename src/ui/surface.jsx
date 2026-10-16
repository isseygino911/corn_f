import { cn } from '@/lib/utils'

const TONES = {
  card: 'tw:bg-card',
  rose: 'tw:bg-tint-rose',
  sand: 'tw:bg-tint-sand',
  sage: 'tw:bg-tint-sage',
  mist: 'tw:bg-tint-mist',
  dark: 'tw:bg-surface-dark tw:text-primary-foreground',
}

// Tones that cards cycle through, so neighbours differ.
export const TONE_CYCLE = ['rose', 'sand', 'sage', 'mist']

// Rounded block on a palette tint (or the dark surface).
export function Surface({ tone = 'card', as: Tag = 'div', className, ...rest }) {
  return <Tag className={cn('tw:rounded-3xl', TONES[tone], className)} {...rest} />
}

// Full-bleed dark hero at the top of a page. `art` is an optional image URL shown beside the title.
export function Band({ eyebrow, title, intro, art, children }) {
  return (
    <header className="ui ui-band tw:bg-surface-dark tw:text-primary-foreground">
      <div className="tw:mx-auto tw:flex tw:max-w-[1200px] tw:items-end tw:justify-between tw:gap-6 tw:px-(--gutter) tw:pt-28 tw:pb-10 tw:md:pt-36 tw:md:pb-14">
        <div className="tw:flex tw:min-w-0 tw:flex-col tw:gap-4">
          {eyebrow && <span className="tw:font-mono tw:text-xs tw:uppercase tw:text-accent">{eyebrow}</span>}
          <h1 className="tw:text-[clamp(40px,6vw,72px)]">{title}</h1>
          {intro && <p className="tw:max-w-[52ch] tw:opacity-80">{intro}</p>}
          {children}
        </div>
        {art && <img src={art} alt="" className="tw:hidden tw:h-40 tw:w-auto tw:object-contain tw:sm:block tw:md:h-56" />}
      </div>
    </header>
  )
}
