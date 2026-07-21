import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import {
  CreateServiceRequestInput,
  ServiceRequestDetailValue,
  ServiceRequestDetails,
} from '../../../shared/models/service-request.model';

type RequestableServiceType = CreateServiceRequestInput['serviceType'];
type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

interface ServiceFormField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
}

interface ServiceFormConfig {
  eyebrow: string;
  title: string;
  intro: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  fields: ServiceFormField[];
}

const FORM_CONFIGS: Record<RequestableServiceType, ServiceFormConfig> = {
  verification: {
    eyebrow: 'Confiance',
    title: 'Demande de vérification anti-fraude',
    intro: 'Transmettez le contexte du bien ou de la transaction. Notre équipe cadrera les vérifications nécessaires.',
    descriptionLabel: 'Point à vérifier',
    descriptionPlaceholder: 'Décrivez les incohérences, documents reçus ou éléments qui vous préoccupent…',
    fields: [
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, placeholder: 'Avenue, quartier, commune, ville' },
      { key: 'transaction_type', label: 'Type de transaction', type: 'select', required: true, options: ['Achat', 'Location', 'Vente', 'Mise en location'] },
      { key: 'verification_scope', label: 'Vérification souhaitée', type: 'select', required: true, options: ['Identité du propriétaire', 'Documents du bien', 'Contrat', 'Situation du bien', 'Vérification complète'] },
      { key: 'documents_available', label: 'Documents disponibles', type: 'textarea', placeholder: 'Titre, contrat, pièce d’identité, procuration…' },
    ],
  },
  'location-vente': {
    eyebrow: 'Transaction',
    title: 'Projet de location ou de vente',
    intro: 'Précisez votre projet afin que RHEODYCE puisse orienter la recherche ou la mise sur le marché.',
    descriptionLabel: 'Critères et contexte',
    descriptionPlaceholder: 'Décrivez les critères essentiels, les contraintes ou le bien à proposer…',
    fields: [
      { key: 'project_type', label: 'Votre projet', type: 'select', required: true, options: ['Je cherche à louer', 'Je cherche à acheter', 'Je souhaite louer mon bien', 'Je souhaite vendre mon bien'] },
      { key: 'property_category', label: 'Type de bien', type: 'select', required: true, options: ['Maison', 'Appartement', 'Résidence', 'Terrain', 'Local professionnel'] },
      { key: 'city', label: 'Ville', type: 'select', required: true, options: ['Kinshasa', 'Lubumbashi', 'Goma', 'Matadi', 'Autre'] },
      { key: 'preferred_area', label: 'Quartier ou zone', type: 'text', placeholder: 'Commune, quartier ou adresse du bien' },
      { key: 'target_date', label: 'Échéance souhaitée', type: 'date' },
    ],
  },
  maintenance: {
    eyebrow: 'Après-vente',
    title: 'Demande d’intervention',
    intro: 'Décrivez la panne et le niveau d’urgence pour permettre un premier diagnostic rapide.',
    descriptionLabel: 'Description du problème',
    descriptionPlaceholder: 'Depuis quand, symptômes observés, équipements concernés…',
    fields: [
      { key: 'intervention_type', label: 'Type d’intervention', type: 'select', required: true, options: ['Plomberie', 'Électricité', 'Peinture', 'Climatisation', 'Nettoyage', 'Autre réparation'] },
      { key: 'urgency', label: 'Niveau d’urgence', type: 'select', required: true, options: ['Urgence immédiate', 'Sous 48 heures', 'Cette semaine', 'À planifier'] },
      { key: 'property_address', label: 'Adresse d’intervention', type: 'text', required: true, placeholder: 'Avenue, quartier, commune, ville' },
      { key: 'preferred_date', label: 'Date souhaitée', type: 'date' },
      { key: 'access_details', label: 'Accès au bien', type: 'textarea', placeholder: 'Étage, gardien, disponibilité, repères utiles…' },
    ],
  },
  decoration: {
    eyebrow: 'Valorisation',
    title: 'Projet de décoration intérieure',
    intro: 'Partagez la nature de l’espace, votre style et votre calendrier pour préparer un accompagnement adapté.',
    descriptionLabel: 'Vision du projet',
    descriptionPlaceholder: 'Ambiance recherchée, contraintes, pièces prioritaires, état actuel…',
    fields: [
      { key: 'project_type', label: 'Type de projet', type: 'select', required: true, options: ['Aménagement sur mesure', 'Rénovation intérieure', 'Home staging', 'Mobilier et lumière'] },
      { key: 'property_address', label: 'Localisation du projet', type: 'text', required: true, placeholder: 'Quartier, commune, ville' },
      { key: 'rooms', label: 'Nombre de pièces concernées', type: 'number', required: true, min: 1 },
      { key: 'preferred_style', label: 'Style préféré', type: 'select', options: ['Contemporain', 'Minimaliste', 'Classique', 'Africain moderne', 'À définir ensemble'] },
      { key: 'target_date', label: 'Date cible', type: 'date' },
    ],
  },
  juridique: {
    eyebrow: 'Protection',
    title: 'Demande d’assistance juridique',
    intro: 'Présentez votre situation sans joindre de données inutilement sensibles. Un conseiller précisera ensuite les pièces utiles.',
    descriptionLabel: 'Résumé de la situation',
    descriptionPlaceholder: 'Expliquez les faits, les démarches déjà entreprises et le résultat attendu…',
    fields: [
      { key: 'case_type', label: 'Nature du besoin', type: 'select', required: true, options: ['Analyse de contrat', 'Vérification de propriété', 'Litige locatif', 'Transaction immobilière', 'Succession', 'Autre'] },
      { key: 'property_address', label: 'Bien concerné', type: 'text', placeholder: 'Adresse ou zone du bien' },
      { key: 'deadline', label: 'Échéance connue', type: 'date' },
      { key: 'documents_available', label: 'Pièces disponibles', type: 'textarea', placeholder: 'Contrat, titre, mise en demeure, correspondances…' },
    ],
  },
};

@Component({
  selector: 'app-service-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './service-request-form.html',
})
export class ServiceRequestFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly requests = inject(ServiceRequestService);

  protected readonly serviceType = signal<RequestableServiceType | null>(null);
  protected readonly config = signal<ServiceFormConfig | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');

  protected clientName = '';
  protected clientEmail = '';
  protected clientPhone = '';
  protected description = '';
  protected budget: number | null = null;
  protected details: ServiceRequestDetails = {};

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type');
    if (!isRequestableServiceType(type)) return;

    this.serviceType.set(type);
    this.config.set(FORM_CONFIGS[type]);
    const profile = this.auth.profile();
    this.clientName = profile?.full_name ?? this.sessionName();
    this.clientEmail = profile?.email ?? this.auth.userEmail();
    this.clientPhone = profile?.phone ?? '';
  }

  protected detailValue(key: string): ServiceRequestDetailValue | undefined {
    return this.details[key];
  }

  protected setDetail(key: string, value: ServiceRequestDetailValue): void {
    this.details = { ...this.details, [key]: value };
  }

  protected async submit(): Promise<void> {
    const type = this.serviceType();
    const config = this.config();
    if (!type || !config) return;

    this.error.set('');
    const validationError = this.validate(config);
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    this.isSubmitting.set(true);
    try {
      const request = await this.requests.createRequest({
        serviceType: type,
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        clientPhone: this.clientPhone,
        description: this.description,
        details: this.details,
        budget: this.budget ?? undefined,
      });
      await this.router.navigate(['/mon-compte/demandes', request.id], {
        queryParams: { created: '1' },
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'La demande n’a pas pu être enregistrée.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private validate(config: ServiceFormConfig): string | null {
    if (!this.clientName.trim() || !this.clientEmail.trim() || !this.clientPhone.trim()) {
      return 'Complétez vos coordonnées de contact.';
    }
    if (!/^\S+@\S+\.\S+$/.test(this.clientEmail.trim())) return 'Saisissez une adresse email valide.';
    if (this.description.trim().length < 20) return 'Décrivez votre besoin en au moins 20 caractères.';
    if (this.budget !== null && this.budget < 0) return 'Le budget ne peut pas être négatif.';

    const missing = config.fields.find((field) => {
      if (!field.required) return false;
      const value = this.details[field.key];
      return value === undefined || value === null || value === '';
    });
    return missing ? `Le champ « ${missing.label} » est obligatoire.` : null;
  }

  private sessionName(): string {
    const value = this.auth.session()?.user.user_metadata?.['full_name'];
    return typeof value === 'string' ? value : '';
  }
}

function isRequestableServiceType(value: string | null): value is RequestableServiceType {
  return value !== null && Object.prototype.hasOwnProperty.call(FORM_CONFIGS, value);
}
