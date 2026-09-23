import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import { Router, RouterLink, Scroll } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-client-satisfaction',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-satisfaction.html',
  styleUrl: './client-satisfaction.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientSatisfaction {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private trigger?: ScrollTrigger;
  private panels: HTMLElement[] = [];
  protected readonly activeIndex = signal(0);
  protected readonly chapters = [
    'L’essentiel',
    'Notre histoire',
    'Nos valeurs',
    'À votre écoute',
    'À vos côtés',
    'Notre engagement',
  ];
  protected readonly values = [
    {
      number: '01',
      title: 'Qualité et Excellence',
      description: 'Nous veillons à offrir des prestations et produits irréprochables.',
    },
    {
      number: '02',
      title: 'Proximité et Écoute',
      description:
        'Chaque client est unique, et nous mettons un point d’honneur à comprendre vos besoins.',
    },
    {
      number: '03',
      title: 'Innovation et Engagement',
      description:
        'Nous restons à la pointe de notre secteur pour vous apporter les meilleures solutions.',
    },
  ];
  protected readonly steps = [
    {
      number: '01',
      title: 'Prise de contact',
      description: 'Nous prenons contact pour comprendre vos besoins et répondre à vos questions.',
    },
    {
      number: '02',
      title: 'Évaluation sur site ou sur plans',
      description:
        'Un expert évalue les lieux ou analyse les plans pour adapter nos services à votre environnement.',
    },
    {
      number: '03',
      title: 'Envoi de devis définitif',
      description: 'Nous vous envoyons un devis détaillé avec un calendrier indicatif.',
    },
    {
      number: '04',
      title: 'Planification des opérations',
      description: 'Nous planifions les interventions en fonction de vos disponibilités.',
    },
    {
      number: '05',
      title: 'Réalisation et suivi',
      description:
        'Nos équipes réalisent les travaux avec un suivi rigoureux jusqu’à la finalisation.',
    },
  ];

  constructor() {
    afterNextRender(() =>
      this.zone.runOutsideAngular(() => {
        gsap.registerPlugin(ScrollTrigger);
        const root = this.host.nativeElement;
        const stage = root.querySelector<HTMLElement>('.story-stage')!;
        const track = root.querySelector<HTMLElement>('.story-track')!;
        const progress = root.querySelector<HTMLElement>('.story-progress-fill')!;
        this.panels = Array.from(root.querySelectorAll<HTMLElement>('.story-panel'));
        const media = gsap.matchMedia();
        media.add(
          '(prefers-reduced-motion: no-preference)',
          () => {
            // Measure chapter origins, never decorative or transformed overflow.
            const travel = () =>
              this.panels[this.panels.length - 1].offsetLeft - this.panels[0].offsetLeft;
            const tween = gsap.to(track, {
              x: () => -travel(),
              ease: 'none',
              scrollTrigger: {
                trigger: stage,
                start: 'top 80px',
                end: () =>
                  '+=' +
                  Math.max(
                    stage.clientHeight,
                    (travel() / stage.clientWidth) * stage.clientHeight * 1.15,
                  ),
                pin: true,
                scrub: 0.65,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  progress.style.transform = `scaleX(${self.progress})`;
                },
              },
              onUpdate: () => {
                const x = Math.abs(Number(gsap.getProperty(track, 'x')));
                const index = Math.min(this.panels.length - 1, Math.round(x / stage.clientWidth));
                if (index !== this.activeIndex()) this.zone.run(() => this.activeIndex.set(index));
              },
            });
            this.trigger = tween.scrollTrigger;
            this.panels.forEach((panel, index) => {
              if (index > 0) {
                gsap.fromTo(
                  panel.querySelectorAll('[data-reveal]'),
                  { y: 48, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    stagger: 0.07,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: tween,
                      start: 'left 90%',
                      end: 'left 28%',
                      scrub: true,
                    },
                  },
                );
              }
              const motif = panel.querySelector('.story-motif');
              if (motif)
                gsap.fromTo(
                  motif,
                  { rotate: -20, scale: 0.8 },
                  {
                    rotate: 30,
                    scale: 1.12,
                    ease: 'none',
                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: tween,
                      start: 'left right',
                      end: 'right left',
                      scrub: true,
                    },
                  },
                );
            });
            return () => {
              this.trigger = undefined;
              progress.style.removeProperty('transform');
            };
          },
          root,
        );
        const onFocus = (event: FocusEvent) => {
          const panel = (event.target as HTMLElement).closest<HTMLElement>('.story-panel');
          if (panel) {
            // Focus may otherwise scroll the clipped window independently of the timeline.
            root.querySelector<HTMLElement>('.story-window')!.scrollLeft = 0;
            stage.scrollLeft = 0;
            this.scrollTo(this.panels.indexOf(panel), false);
          }
        };
        track.addEventListener('focusin', onFocus);
        const alignAboutAnchor = () => {
          if (this.destroyRef.destroyed || !this.trigger) return;
          this.scrollTo(0, false);
        };
        // Angular's anchor scroller uses element coordinates and ignores scroll-margin.
        // Align to the pin start after it scrolls, so chapter 01 remains fully visible.
        const routerScroll = this.router.events.subscribe((event) => {
          if (event instanceof Scroll && event.anchor === 'about') {
            queueMicrotask(alignAboutAnchor);
          }
        });
        // Fonts can change wrapping after the initial pin measurement.
        document.fonts.ready.then(() => {
          if (!this.destroyRef.destroyed) {
            ScrollTrigger.refresh();
            if (window.location.hash === '#about') alignAboutAnchor();
          }
        });
        this.destroyRef.onDestroy(() => {
          routerScroll.unsubscribe();
          track.removeEventListener('focusin', onFocus);
          media.revert();
        });
      }),
    );
  }

  protected scrollTo(index: number, smooth = true): void {
    if (index < 0 || index >= this.panels.length) return;
    if (!this.trigger) {
      this.panels[index].scrollIntoView({ behavior: 'auto', block: 'center' });
      return;
    }
    const first = this.panels[0].offsetLeft;
    const travel = this.panels[this.panels.length - 1].offsetLeft - first;
    const progress = travel > 0 ? (this.panels[index].offsetLeft - first) / travel : 0;
    window.scrollTo({
      top: this.trigger.start + progress * (this.trigger.end - this.trigger.start),
      behavior: smooth ? 'smooth' : 'instant',
    });
  }
}
