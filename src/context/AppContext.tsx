import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Employee, Contact, Equipment, Vehicle, Offer, Business,
  Alert, Invoice, BankAccount, CashRegister, Tax
} from '../types';
import * as mockData from '../data/mockData';

interface AppState {
  employees: Employee[];
  contacts: Contact[];
  equipment: Equipment[];
  vehicles: Vehicle[];
  offers: Offer[];
  businesses: Business[];
  alerts: Alert[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  cashRegisters: CashRegister[];
  taxes: Tax[];
}

interface AppContextType {
  state: AppState;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (equipment: Equipment) => void;
  deleteEquipment: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (business: Business) => void;
  deleteBusiness: (id: string) => void;
}

const initialState: AppState = {
  employees: mockData.employees,
  contacts: mockData.contacts,
  equipment: mockData.equipment,
  vehicles: mockData.vehicles,
  offers: mockData.offers,
  businesses: mockData.businesses,
  alerts: mockData.alerts,
  invoices: mockData.invoices,
  bankAccounts: mockData.bankAccounts,
  cashRegisters: mockData.cashRegisters,
  taxes: mockData.taxes,
};

type Action =
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'DELETE_EQUIPMENT'; payload: string }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'ADD_BUSINESS'; payload: Business }
  | { type: 'UPDATE_BUSINESS'; payload: Business }
  | { type: 'DELETE_BUSINESS'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'ADD_BUSINESS':
      return { ...state, businesses: [...state.businesses, action.payload] };
    case 'UPDATE_BUSINESS':
      return {
        ...state,
        businesses: state.businesses.map(biz =>
          biz.id === action.payload.id ? action.payload : biz
        )
      };
    case 'DELETE_BUSINESS':
      return {
        ...state,
        businesses: state.businesses.filter(biz => biz.id !== action.payload)
      };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? action.payload : emp
        )
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact => 
          contact.id === action.payload.id ? action.payload : contact
        )
      };
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload)
      };
    case 'ADD_EQUIPMENT':
      return { ...state, equipment: [...state.equipment, action.payload] };
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map(eq => 
          eq.id === action.payload.id ? action.payload : eq
        )
      };
    case 'DELETE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.filter(eq => eq.id !== action.payload)
      };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle => 
          vehicle.id === action.payload.id ? action.payload : vehicle
        )
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload)
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue: AppContextType = {
    state,
    addEmployee: (employee) => dispatch({ type: 'ADD_EMPLOYEE', payload: employee }),
    updateEmployee: (employee) => dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee }),
    deleteEmployee: (id) => dispatch({ type: 'DELETE_EMPLOYEE', payload: id }),
    addContact: (contact) => dispatch({ type: 'ADD_CONTACT', payload: contact }),
    updateContact: (contact) => dispatch({ type: 'UPDATE_CONTACT', payload: contact }),
    deleteContact: (id) => dispatch({ type: 'DELETE_CONTACT', payload: id }),
    addEquipment: (equipment) => dispatch({ type: 'ADD_EQUIPMENT', payload: equipment }),
    updateEquipment: (equipment) => dispatch({ type: 'UPDATE_EQUIPMENT', payload: equipment }),
    deleteEquipment: (id) => dispatch({ type: 'DELETE_EQUIPMENT', payload: id }),
    addVehicle: (vehicle) => dispatch({ type: 'ADD_VEHICLE', payload: vehicle }),
    updateVehicle: (vehicle) => dispatch({ type: 'UPDATE_VEHICLE', payload: vehicle }),
    deleteVehicle: (id) => dispatch({ type: 'DELETE_VEHICLE', payload: id }),
    addBusiness: (business) => dispatch({ type: 'ADD_BUSINESS', payload: business }),
    updateBusiness: (business) => dispatch({ type: 'UPDATE_BUSINESS', payload: business }),
    deleteBusiness: (id) => dispatch({ type: 'DELETE_BUSINESS', payload: id }),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
