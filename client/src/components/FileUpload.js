import React, { useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

const FileUpload = ({ onFileSelect, file, onFileClear }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      // Limit files to 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size exceeds the maximum 5MB limit.');
        return;
      }
      onFileSelect(selectedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size exceeds the maximum 5MB limit.');
        return;
      }
      onFileSelect(selectedFile);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        Attachments (Upload Proof PDF or Image)
      </label>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <Upload className="text-slate-400 mb-2" size={24} />
          <p className="text-sm font-medium text-slate-700">
            Drag & drop file here, or click to choose
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports Images & PDFs up to 5MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-emerald-100 bg-emerald-50/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              {file.type?.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 max-w-[200px] sm:max-w-xs truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileClear();
            }}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
