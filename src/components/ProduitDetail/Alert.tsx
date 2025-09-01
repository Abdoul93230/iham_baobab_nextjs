"use client";

import React from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface AlertProps {
  type: "success" | "warn" | "error" | "info";
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        };
      case "warn":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: <XCircle className="w-5 h-5 text-red-600" />,
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: <Info className="w-5 h-5 text-blue-600" />,
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-800",
          icon: <Info className="w-5 h-5 text-gray-600" />,
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div
        className={`${styles.container} border-l-4 p-4 rounded-r-lg shadow-lg animate-in slide-in-from-right duration-300`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
