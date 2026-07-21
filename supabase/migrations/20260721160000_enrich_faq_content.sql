begin;

update public.faqs
set
  answer = 'Les informations essentielles sont contrôlées avant publication : identité du contact, disponibilité, documents, localisation, prix et photos.',
  display_order = 3
where question = 'Comment RHEODYCE vérifie les annonces ?';

update public.faqs
set display_order = 4
where question = 'Pourquoi certaines informations sont réservées aux abonnés ?';

update public.faqs
set
  answer = 'Oui. Consultez d’abord la fiche publique, puis demandez une visite. L’équipe vous accompagne dans l’organisation du rendez-vous.',
  display_order = 5
where question = 'Puis-je demander une visite avant de payer ?';

update public.faqs
set
  answer = 'RHEODYCE centralise, vérifie et facilite la transaction. Un agent ou un partenaire juridique peut intervenir selon votre besoin.',
  display_order = 8
where question = 'RHEODYCE remplace-t-il un agent immobilier ?';

insert into public.faqs (question, answer, display_order)
select
  'Qu’est-ce que RHEODYCE ?',
  'RHEODYCE est une plateforme immobilière qui réunit des annonces vérifiées et des services pour louer, acheter, vendre ou entretenir un bien.',
  1
where not exists (
  select 1 from public.faqs where question = 'Qu’est-ce que RHEODYCE ?'
);

insert into public.faqs (question, answer, display_order)
select
  'Que puis-je faire sur RHEODYCE ?',
  'Vous pouvez rechercher un bien, consulter des annonces, demander une visite et obtenir un accompagnement pour votre projet immobilier.',
  2
where not exists (
  select 1 from public.faqs where question = 'Que puis-je faire sur RHEODYCE ?'
);

insert into public.faqs (question, answer, display_order)
select
  'Quels services complémentaires sont proposés ?',
  'RHEODYCE propose notamment la maintenance, la décoration intérieure, le déménagement et l’aménagement ainsi que des conseils immobiliers.',
  6
where not exists (
  select 1 from public.faqs where question = 'Quels services complémentaires sont proposés ?'
);

insert into public.faqs (question, answer, display_order)
select
  'Puis-je obtenir une assistance juridique ?',
  'Oui. RHEODYCE peut vous orienter vers un cabinet partenaire pour un contrat, un litige ou un conseil lié à une transaction immobilière.',
  7
where not exists (
  select 1 from public.faqs where question = 'Puis-je obtenir une assistance juridique ?'
);

commit;
