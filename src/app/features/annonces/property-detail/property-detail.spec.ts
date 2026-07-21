import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RheodyceDataService } from '../../../core/services/rheodyce-data.service';
import { Property } from '../../../shared/models/property.model';
import { PropertyDetailPage } from './property-detail';

describe('PropertyDetailPage', () => {
  const property: Property = {
    id: 'bien-1',
    title: 'Villa moderne à Gombe',
    price: 2500,
    priceSuffix: '/mois',
    location: 'Gombe, Kinshasa',
    address: 'Gombe, Kinshasa',
    bedrooms: 3,
    bathrooms: 2,
    surface: 180,
    type: 'location',
    category: 'maison',
    imageUrl: '/assets/hero_img.png',
    description: 'Une villa moderne.',
  };

  let fixture: ComponentFixture<PropertyDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: property.id }) } },
        },
        { provide: RheodyceDataService, useValue: { properties: [property] } },
        { provide: AuthService, useValue: { isSubscriber: signal(false) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailPage);
    fixture.detectChanges();
  });

  it('shares the property information and its URL', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Partager l\'annonce"]',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(share).toHaveBeenCalledWith({
      title: property.title,
      text: expect.stringContaining('Gombe, Kinshasa'),
      url: window.location.href,
    });
  });
});
