import { 
    Employee, Contact, Equipment, Vehicle, Offer, Business, 
    Alert, Invoice, BankAccount, CashRegister, Tax 
  } from '../types';
  
  export const employees: Employee[] = [
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      position: 'Directeur Général',
      department: 'Direction',
      email: 'jean.dupont@company.com',
      phone: '+33 1 23 45 67 89',
      hireDate: '2020-01-15',
      salary: 75000,
      status: 'active'
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      position: 'Chef de Projet',
      department: 'Production',
      email: 'marie.martin@company.com',
      phone: '+33 1 23 45 67 90',
      hireDate: '2021-03-20',
      salary: 55000,
      status: 'active'
    },
    {
      id: '3',
      firstName: 'Pierre',
      lastName: 'Bernard',
      position: 'Technicien',
      department: 'Maintenance',
      email: 'pierre.bernard@company.com',
      phone: '+33 1 23 45 67 91',
      hireDate: '2019-06-10',
      salary: 42000,
      status: 'active'
    }
  ];
  
  export const contacts: Contact[] = [
    {
      id: '1',
      firstName: 'Sophie',
      lastName: 'Rousseau',
      group: 'CLIENT',
      company: 'TechCorp',
      email: 'sophie.rousseau@techcorp.com',
      cellPhone1: '+33 2 34 56 78 90',
      cellPhone2: '+33 2 34 56 78 91',
      landlinePhone: '+33 1 23 45 67 89',
      address: '123 Avenue des Entreprises, 75001 Paris',
      country: 'France',
      registrationDate: '2023-01-15'
    },
    {
      id: '2',
      firstName: 'Marc',
      lastName: 'Leroy',
      group: 'SUPPLIER',
      company: 'Fournisseur Pro',
      email: 'marc.leroy@fournisseurpro.com',
      cellPhone1: '+33 3 45 67 89 01',
      landlinePhone: '+33 1 23 45 67 90',
      address: '456 Rue du Commerce, 69000 Lyon',
      country: 'France',
      registrationDate: '2023-02-20'
    }
  ];
  
  export const equipment: Equipment[] = [
    {
      id: '1',
      name: 'Excavatrice CAT 320',
      type: 'Engin de chantier',
      status: 'in-use',
      location: 'Chantier A',
      purchaseDate: '2022-01-15',
      value: 150000,
      assignedTo: 'Équipe 1'
    },
    {
      id: '2',
      name: 'Ordinateur portable Dell',
      type: 'Informatique',
      status: 'available',
      location: 'Bureau principal',
      purchaseDate: '2023-03-10',
      value: 1200
    }
  ];
  
  export const vehicles: Vehicle[] = [
    {
      id: '1',
      brand: 'Renault',
      model: 'Master',
      licensePlate: 'AB-123-CD',
      type: 'van',
      year: 2022,
      mileage: 15000,
      status: 'in-use',
      assignedTo: 'Jean Dupont',
      fuelType: 'diesel',
      acquisitionDate: '2022-01-15',
      usingEntity: 'SITINFRA_SARL',
      holder: 'SITINFRA_SARL',
      chassisNumber: 'VF1234567890123456'
    },
    {
      id: '2',
      brand: 'Peugeot',
      model: '308',
      licensePlate: 'EF-456-GH',
      type: 'car',
      year: 2021,
      mileage: 25000,
      status: 'available',
      fuelType: 'gasoline',
      acquisitionDate: '2021-06-01',
      usingEntity: 'SITINFRA_SARL',
      holder: 'SITINFRA_SARL',
      chassisNumber: 'VF9876543210987654'
    }
  ];
  
  export const offers: Offer[] = [
    {
      id: '1',
      name: 'Service de maintenance annuel',
      object: 'Contrat de maintenance préventive et curative',
      amount: 15000,
      validityDate: '2024-12-31',
      category: 'Services',
      status: 'active',
      currency: 'EUR',
      depositDate: '2024-01-01',
      // Pour compatibilité
      title: 'Service de maintenance annuel',
      price: 15000,
      validFrom: '2024-01-01',
      validTo: '2024-12-31'
    },
    {
      id: '2',
      name: 'Formation sécurité chantier',
      object: 'Formation complète aux règles de sécurité sur chantier',
      amount: 2500,
      validityDate: '2024-06-30',
      category: 'Formation',
      status: 'active',
      currency: 'EUR',
      depositDate: '2024-02-01',
      // Pour compatibilité
      title: 'Formation sécurité chantier',
      price: 2500,
      validFrom: '2024-02-01',
      validTo: '2024-06-30'
    },
    {
      id: '3',
      name: 'Audit énergétique bâtiment',
      object: 'Audit complet de performance énergétique',
      amount: 8000,
      validityDate: '2024-03-15',
      category: 'Audit',
      status: 'draft',
      currency: 'EUR',
      depositDate: '2024-01-15',
      // Pour compatibilité
      title: 'Audit énergétique bâtiment',
      price: 8000,
      validFrom: '2024-01-15',
      validTo: '2024-03-15'
    }
  ];
  
  export const businesses: Business[] = [
    {
      id: '1',
      name: 'Projet Alpha',
      client: 'TechCorp',
      status: 'negotiation',
      value: 85000,
      currency: 'EUR',
      startDate: '2024-02-01',
      expectedCloseDate: '2024-03-15',
      progress: 65
    },
    {
      id: '2',
      name: 'Rénovation Bureau Beta',
      client: 'Entreprise Martin',
      status: 'won',
      value: 125000,
      currency: 'EUR',
      startDate: '2024-01-10',
      expectedCloseDate: '2024-04-30',
      progress: 100
    },
    {
      id: '3',
      name: 'Installation Gamma',
      client: 'Industries Dupont',
      status: 'prospect',
      value: 45000,
      currency: 'EUR',
      startDate: '2024-03-01',
      expectedCloseDate: '2024-05-15',
      progress: 25
    }
  ];
  
  export const alerts: Alert[] = [
    {
      id: '1',
      title: 'Échéance contrat TechCorp',
      description: 'Renouvellement du contrat annuel',
      dueDate: '2024-03-30',
      priority: 'high',
      type: 'contract',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Maintenance véhicule AB-123-CD',
      description: 'Révision des 20 000 km',
      dueDate: '2024-02-15',
      priority: 'medium',
      type: 'maintenance',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Renouvellement assurance véhicules',
      description: 'Échéance assurance flotte automobile',
      dueDate: '2024-03-01',
      priority: 'high',
      type: 'contract',
      status: 'pending'
    }
  ];
  
  export const invoices: Invoice[] = [
    {
      id: '1',
      clientName: 'TechCorp',
      amount: 12500,
      status: 'sent',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      items: [
        { description: 'Service de maintenance', quantity: 1, unitPrice: 12500, total: 12500 }
      ]
    },
    {
      id: '2',
      clientName: 'Entreprise Martin',
      amount: 8750,
      status: 'paid',
      issueDate: '2024-01-20',
      dueDate: '2024-02-19',
      items: [
        { description: 'Formation sécurité', quantity: 5, unitPrice: 1750, total: 8750 }
      ]
    },
    {
      id: '3',
      clientName: 'Industries Dupont',
      amount: 15600,
      status: 'overdue',
      issueDate: '2024-01-05',
      dueDate: '2024-02-04',
      items: [
        { description: 'Audit énergétique', quantity: 2, unitPrice: 7800, total: 15600 }
      ]
    }
  ];
  
  export const bankAccounts: BankAccount[] = [
    {
      id: '1',
      name: 'Compte Principal',
      accountNumber: 'FR76 1234 5678 9012 3456 78',
      balance: 125000,
      type: 'business',
      currency: 'EUR',
      transactions: [
        {
          id: '1',
          date: '2024-01-15',
          description: 'Paiement client TechCorp',
          amount: 12500,
          type: 'credit',
          category: 'Revenus'
        },
        {
          id: '2',
          date: '2024-01-18',
          description: 'Salaires janvier',
          amount: -25000,
          type: 'debit',
          category: 'Salaires'
        },
        {
          id: '3',
          date: '2024-01-20',
          description: 'Paiement fournisseur',
          amount: -5500,
          type: 'debit',
          category: 'Achats'
        }
      ]
    },
    {
      id: '2',
      name: 'Compte Épargne',
      accountNumber: 'FR76 9876 5432 1098 7654 32',
      balance: 45000,
      type: 'savings',
      currency: 'EUR',
      transactions: [
        {
          id: '4',
          date: '2024-01-01',
          description: 'Virement depuis compte principal',
          amount: 10000,
          type: 'credit',
          category: 'Épargne'
        }
      ]
    }
  ];
  
  export const cashRegisters: CashRegister[] = [
    {
      id: '1',
      name: 'Caisse Bureau Principal',
      location: 'Bureau Principal',
      balance: 2500,
      transactions: [
        {
          id: '1',
          date: '2024-01-16',
          description: 'Petite caisse - fournitures',
          amount: 150,
          type: 'out'
        },
        {
          id: '2',
          date: '2024-01-17',
          description: 'Remboursement frais déplacement',
          amount: 85,
          type: 'out'
        },
        {
          id: '3',
          date: '2024-01-18',
          description: 'Approvisionnement caisse',
          amount: 500,
          type: 'in'
        }
      ]
    },
    {
      id: '2',
      name: 'Caisse Chantier A',
      location: 'Chantier A - Zone Nord',
      balance: 800,
      transactions: [
        {
          id: '4',
          date: '2024-01-19',
          description: 'Achat matériel urgence',
          amount: 120,
          type: 'out'
        }
      ]
    }
  ];
  
  export const taxes: Tax[] = [
    {
      id: '1',
      name: 'TVA Janvier 2024',
      type: 'VAT',
      rate: 20,
      dueDate: '2024-02-20',
      amount: 8500,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Charges sociales Q4 2023',
      type: 'payroll',
      rate: 45,
      dueDate: '2024-02-15',
      amount: 15600,
      status: 'pending'
    },
    {
      id: '3',
      name: 'Impôt société 2023',
      type: 'corporate',
      rate: 25,
      dueDate: '2024-05-15',
      amount: 32000,
      status: 'pending'
    },
    {
      id: '4',
      name: 'TVA Décembre 2023',
      type: 'VAT',
      rate: 20,
      dueDate: '2024-01-20',
      amount: 7200,
      status: 'paid'
    }
  ];