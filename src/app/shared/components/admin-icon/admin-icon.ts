import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AdminIconName =
  | 'dashboard'
  | 'calendar'
  | 'users'
  | 'tools'
  | 'mail'
  | 'truck'
  | 'clipboard'
  | 'home'
  | 'search'
  | 'plus'
  | 'arrow-right'
  | 'external'
  | 'pin'
  | 'file'
  | 'upload'
  | 'star'
  | 'logout'
  | 'support';

@Component({
  selector: 'app-admin-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="className()"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('dashboard') {
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="4" rx="1.5" />
          <rect x="14" y="11" width="7" height="10" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="4" rx="1.5" fill="#c5e84a" stroke="none" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
          <rect x="14" y="13" width="4" height="4" rx="1" fill="#c5e84a" stroke="none" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3" />
          <path
            d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M15 5.5a3 3 0 0 1 0 5.8M16.5 14c2.4.5 3.7 2.4 4 5"
          />
          <circle cx="18.5" cy="15.5" r="2.5" fill="#c5e84a" stroke="none" />
        }
        @case ('tools') {
          <path d="m14 6 4-3 3 3-3 4-2.5-.5L8 17l-1 4-4-4 4-1 7.5-7.5z" />
          <circle cx="17.5" cy="6.5" r="1" fill="#c5e84a" stroke="none" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
          <rect x="15" y="14" width="6" height="5" rx="1.5" fill="#c5e84a" stroke="none" />
        }
        @case ('truck') {
          <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <rect x="14" y="7" width="5" height="5" rx="1" fill="#c5e84a" stroke="none" />
        }
        @case ('clipboard') {
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4V2h6v2M8 10h8M8 14h5" />
          <rect x="14" y="13" width="6" height="6" rx="1.5" fill="#c5e84a" stroke="none" />
        }
        @case ('home') {
          <path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" fill="#c5e84a" stroke="none" />
        }
        @case ('search') {
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
          <circle cx="15.5" cy="15.5" r="2" fill="#c5e84a" stroke="none" />
        }
        @case ('plus') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
          <circle cx="17.5" cy="6.5" r="2.5" fill="#c5e84a" stroke="none" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M14 7l5 5-5 5" />
        }
        @case ('external') {
          <path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
        }
        @case ('pin') {
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" fill="#c5e84a" stroke="none" />
        }
        @case ('file') {
          <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h4" />
          <rect x="14" y="15" width="5" height="5" rx="1" fill="#c5e84a" stroke="none" />
        }
        @case ('upload') {
          <path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" />
        }
        @case ('star') {
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
          <circle cx="18" cy="6" r="2.5" fill="#c5e84a" stroke="none" />
        }
        @case ('logout') {
          <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
        }
        @case ('support') {
          <circle cx="12" cy="12" r="9" />
          <path d="M9.8 9a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.1.9-1.1 1.9M12 17h.01" />
          <circle cx="18" cy="6" r="2.5" fill="#c5e84a" stroke="none" />
        }
      }
    </svg>
  `,
})
export class AdminIcon {
  readonly name = input.required<string>();
  readonly className = input('size-5');
}
