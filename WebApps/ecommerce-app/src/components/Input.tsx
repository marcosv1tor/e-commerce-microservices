import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className, ...props }: InputProps) {
    const base = "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white";
    return (
        <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
                {label}
            </label>
            <input
                className={`${base} ${className ?? ''}`}
                {...props}
            />
        </div>
    );
}