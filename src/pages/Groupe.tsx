import React from 'react';

// Mapping des rôles vers les labels d'affichage
const countryToTopRoleLabel: Record<string, string> = {
  CAMEROON: 'Responsable SITINFRA CMR',
  IVORY_COAST: 'Responsable SITINFRA CIV',
  ITALIE: 'Responsable SITALIA IT',
  ITALIEPKBIM: 'Responsable PKBIM ITPKBIM',
  ROMANIE: 'Responsable SIT Infrastructure ROM',
  GHANA: 'Responsable GEOTOP GHA',
  BENIN: 'Responsable GEOTOP BEN',
  TOGO: 'Responsable GEOTOP TOG',
  SIERRALEONE: 'Responsable GEOTOP SL',
  GUINEE: 'Responsable GUI',
  BURKINAFASO: 'Responsable BUR',
};

const getRoleLabels = (country: string) => ({
  PRESIDENT_DIRECTEUR_GENERALE: countryToTopRoleLabel[country] || 'PRÉSIDENT DIRECTEUR GÉNÉRALE',
  SECRETARIAT: 'SECRÉTARIAT',
  DIRECTION_ADMINISTRATIVE: 'DIRECTION ADMINISTRATIVE',
  AUDIT_ET_CONTROLE_DE_GESTION: 'AUDIT ET CONTRÔLE DE GESTION',
  ADMINISTRATIF_FINANCIER: 'ADMINISTRATIF / FINANCIER',
  RESSOURCES_HUMAINES: 'RESSOURCES HUMAINES',
  DIRECTION_COMMERCIALE: 'DIRECTION COMMERCIALE',
  DEMARCHE_COMMERCIALE: 'DÉMARCHE COMMERCIALE',
  AMID_DAO: 'AMID/DAO',
  DIRECTION_TECHNIQUE: 'DIRECTION TECHNIQUE',
  PROJET_VRD: 'PROJET VRD',
  TOPOGRAPHIE: 'TOPOGRAPHIE',
  SIG: 'SIG',
  ENVIRONNEMENT_SOCIOLOGUE: 'ENVIRONNEMENT / SOCIOLOGUE',
  DIRECTION_INFORMATIQUE: 'DIRECTION INFORMATIQUE',
  BD_GENIE: 'BD GÉNIE',
  PK_BIM: 'PK/BIM',
  APP: 'APP',
  WEB_MIA: 'WEB/IA',
});

// Structure de l'organigramme par lignes
const organigrammeStructure = [
  {
    level: 1,
    roles: ['PRESIDENT_DIRECTEUR_GENERALE'],
  },
  {
    level: 2,
    roles: ['SECRETARIAT'],
  },
  {
    level: 3,
    roles: ['DIRECTION_ADMINISTRATIVE', 'AUDIT_ET_CONTROLE_DE_GESTION'],
  },
  {
    level: 4,
    roles: ['ADMINISTRATIF_FINANCIER', 'RESSOURCES_HUMAINES'],
  },
  {
    level: 5,
    roles: ['DIRECTION_COMMERCIALE'],
  },
  {
    level: 6,
    roles: ['DEMARCHE_COMMERCIALE', 'AMID_DAO'],
  },
  {
    level: 7,
    roles: ['DIRECTION_TECHNIQUE'],
  },
  {
    level: 8,
    roles: ['PROJET_VRD', 'TOPOGRAPHIE', 'SIG', 'ENVIRONNEMENT_SOCIOLOGUE'],
  },
  {
    level: 9,
    roles: ['DIRECTION_INFORMATIQUE'],
  },
  {
    level: 10,
    roles: ['BD_GENIE', 'PK_BIM', 'APP', 'WEB_MIA'],
  },
];

// Liste des pays à afficher
const countries = [
  'CAMEROON',
  'IVORY_COAST',
  'ITALIE',
  'ITALIEPKBIM',
  'ROMANIE',
  'GHANA',
  'BENIN',
  'TOGO',
  'SIERRALEONE',
  'GUINEE',
  'BURKINAFASO',
];

// Structure de l'organigramme général du groupe
const generalOrganigramme = [
  {
    title: 'Responsable du Groupe',
    roles: ['Responsable du Groupe']
  },
  {
    title: 'Fonctions Transversales',
    roles: ['Secrétariat']
  },
  {
    title: 'Directions Principales',
    roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité']
  },
  {
    title: 'Responsables par Pays',
    roles: [
      'Responsable SITINFRA CMR',
      'Responsable SITINFRA CIV',
      'Responsable SITALIA IT',
      'Responsable PKBIM ITPKBIM',
      'Responsable SIT Infrastructure ROM',
      'Responsable GEOTOP GHA',
      'Responsable GEOTOP BEN',
      'Responsable GEOTOP TOG',
      'Responsable GEOTOP SL',
      'Responsable GUI',
      'Responsable BUR'
    ]
  },
  {
    title: 'Secrétariats par Pays',
    roles: Array(11).fill('SECRÉTARIAT')
  },
  {
    title: 'Directions Administratives par Pays',
    roles: Array(11).fill('DIRECTION ADMINISTRATIVE')
  },
  {
    title: 'Audit et Contrôle de Gestion par Pays',
    roles: Array(11).fill('AUDIT ET CONTRÔLE DE GESTION')
  },
  {
    title: 'Administratif/Financier par Pays',
    roles: Array(11).fill('ADMINISTRATIF / FINANCIER')
  },
  {
    title: 'Ressources Humaines par Pays',
    roles: Array(11).fill('RESSOURCES HUMAINES')
  },
  {
    title: 'Directions Commerciales par Pays',
    roles: Array(11).fill('DIRECTION COMMERCIALE')
  },
  {
    title: 'Démarche Commerciale par Pays',
    roles: Array(11).fill('DÉMARCHE COMMERCIALE')
  },
  {
    title: 'AMID/DAO par Pays',
    roles: Array(11).fill('AMID/DAO')
  },
  {
    title: 'Directions Techniques par Pays',
    roles: Array(11).fill('DIRECTION TECHNIQUE')
  },
  {
    title: 'Projets VRD par Pays',
    roles: Array(11).fill('PROJET VRD')
  },
  {
    title: 'Topographie par Pays',
    roles: Array(11).fill('TOPOGRAPHIE')
  },
  {
    title: 'SIG par Pays',
    roles: Array(11).fill('SIG')
  },
  {
    title: 'Environnement/Sociologue par Pays',
    roles: Array(11).fill('ENVIRONNEMENT / SOCIOLOGUE')
  },
  {
    title: 'Directions Informatiques par Pays',
    roles: Array(11).fill('DIRECTION INFORMATIQUE')
  },
  {
    title: 'BD Génie par Pays',
    roles: Array(11).fill('BD GÉNIE')
  },
  {
    title: 'PK/BIM par Pays',
    roles: Array(11).fill('PK/BIM')
  },
  {
    title: 'APP par Pays',
    roles: Array(11).fill('APP')
  },
  {
    title: 'WEB/IA par Pays',
    roles: Array(11).fill('WEB/IA')
  }
];

// Organigrammes par pays
const countryOrganigrammes = [
  {
    country: 'CAMEROON',
    company: 'SITINFRA',
    abbr: 'CMR',
    structure: [
      { level: 1, roles: ['Responsable SITINFRA CMR'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'IVORY_COAST',
    company: 'SITINFRA',
    abbr: 'CIV',
    structure: [
      { level: 1, roles: ['Responsable SITINFRA CIV'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'ITALIE',
    company: 'SITALIA',
    abbr: 'IT',
    structure: [
      { level: 1, roles: ['Responsable SITALIA IT'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'ITALIEPKBIM',
    company: 'PKBIM',
    abbr: 'ITPKBIM',
    structure: [
      { level: 1, roles: ['Responsable PKBIM ITPKBIM'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'ROMANIE',
    company: 'SIT Infrastructure',
    abbr: 'ROM',
    structure: [
      { level: 1, roles: ['Responsable SIT Infrastructure ROM'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'GHANA',
    company: 'GEOTOP',
    abbr: 'GHA',
    structure: [
      { level: 1, roles: ['Responsable GEOTOP GHA'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'BENIN',
    company: 'GEOTOP',
    abbr: 'BEN',
    structure: [
      { level: 1, roles: ['Responsable GEOTOP BEN'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'TOGO',
    company: 'GEOTOP',
    abbr: 'TOG',
    structure: [
      { level: 1, roles: ['Responsable GEOTOP TOG'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'SIERRALEONE',
    company: 'GEOTOP',
    abbr: 'SL',
    structure: [
      { level: 1, roles: ['Responsable GEOTOP SL'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'GUINEE',
    company: 'GUI',
    abbr: 'GUI',
    structure: [
      { level: 1, roles: ['Responsable GUI'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  },
  {
    country: 'BURKINAFASO',
    company: 'BUR',
    abbr: 'BUR',
    structure: [
      { level: 1, roles: ['Responsable BUR'] },
      { level: 2, roles: ['Secrétariat'] },
      { level: 3, roles: ['Direction Administrative et Commerciale', 'Direction Technique', 'Responsable Contrôle Qualité'] }
    ]
  }
];

export function Groupe() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ORGANIGRAMME GROUPE</h1>
        </div>

        {/* Organigramme général unifié */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Organigramme Général du Groupe
          </h2>

          <div className="space-y-6">
            {generalOrganigramme.map((section, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-3">{section.title}</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {section.roles.map((role, roleIndex) => (
                    <div
                      key={roleIndex}
                      className="bg-blue-100 border-2 border-blue-300 rounded-lg px-4 py-2 min-w-[200px] text-center"
                    >
                      <span className="text-sm font-medium text-blue-800">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}