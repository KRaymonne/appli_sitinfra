import React, { useState } from 'react';
import { Upload, X, Check, Loader } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface FileUploadProps {
  label?: string;
  required?: boolean;
  value?: string | null;
  onChange?: (url: string | null) => void;
  accept?: string;
  folder?: string;
  className?: string;
  useSupabase?: boolean; // true = Supabase, false = local upload to enterprisefiles
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Fichier',
  required = false,
  value = null,
  onChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  folder = 'public',
  className = '',
  useSupabase = true, // Default to Supabase for backward compatibility
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (useSupabase) {
        // Original Supabase upload
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = `${folder}/${fileName}`;

        // Upload file to Supabase
        const { error: uploadError } = await supabase.storage
          .from('uploadnetlify')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('uploadnetlify')
          .getPublicUrl(filePath);

        if (!urlData) throw new Error('Failed to get public URL');

        setUploadProgress(100);
        onChange?.(urlData.publicUrl);
      } else {
        // Local upload to enterprisefiles
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress for local upload
        setUploadProgress(30);

        const response = await fetch('/.netlify/functions/upload-file', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(70);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'upload');
        }

        const result = await response.json();
        setUploadProgress(100);

        // Return relative path from public directory
        // This will be something like /enterprisefiles/filename.pdf
        onChange?.(result.path);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  const isLocalFile = (url: string | null) => {
    if (!url) return false;
    // Check if it's a relative path (starts with /) and not an HTTP/HTTPS URL
    return url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://');
  };

  const getFileUrl = (url: string | null) => {
    if (!url) return '';
    // If it's a local file (relative path), return as is
    if (isLocalFile(url)) {
      return url;
    }
    // If it's an HTTP/HTTPS URL (Supabase or other), return as is
    return url;
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!value ? (
        <div className="relative">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            accept={accept}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-')}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
            className={`flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <Loader className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Upload en cours... {uploadProgress}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Cliquez pour télécharger un fichier</span>
              </div>
            )}
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            {isLocalFile(value) ? (
              <span className="text-sm text-blue-600 truncate">
                Fichier téléchargé ({value.split('/').pop()})
              </span>
            ) : (
              <a
                href={getFileUrl(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate"
              >
                Fichier téléchargé
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Supprimer le fichier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {value && (
        <div className="mt-2 text-xs text-gray-500">
          <input
            type="text"
            value={value}
            readOnly
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 text-xs"
          />
        </div>
      )}
    </div>
  );
};
