import React from 'react';
import { X } from 'lucide-react';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  fields: { key: string; label: string; render?: (value: any) => React.ReactNode | string }[];
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  fields
}) => {
  if (!isOpen) return null;

  const formatValue = (value: any, render?: (value: any) => React.ReactNode | string): React.ReactNode => {
    if (render) {
      const rendered = render(value);
      if (React.isValidElement(rendered)) return rendered;
      if (typeof rendered === 'string') return rendered;
      return String(rendered);
    }
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (value instanceof Date) return value.toLocaleDateString('fr-FR');
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.key} className="border-b border-gray-200 pb-3">
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      {field.label}
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {React.isValidElement(formatValue(data[field.key], field.render)) ? (
                        <div className="flex items-center">
                          {formatValue(data[field.key], field.render)}
                        </div>
                      ) : (
                        formatValue(data[field.key], field.render)
                      )}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

