import React, { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div
        style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: "6px" }}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: disabled ? "#555568" : "#a1a1b5",
              letterSpacing: "0.02em",
              userSelect: "none",
              transition: "color 0.2s ease",
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {leftIcon && (
            <span
              style={{
                position: "absolute",
                left: "12px",
                display: "flex",
                alignItems: "center",
                color: error ? "#f87171" : disabled ? "#555568" : "#6b6b85",
                pointerEvents: "none",
                zIndex: 1,
                fontSize: "16px",
                transition: "color 0.2s ease",
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={className}
            style={{
              width: fullWidth ? "100%" : "auto",
              minWidth: "0",
              padding: `10px ${rightIcon ? "40px" : "14px"} 10px ${leftIcon ? "40px" : "14px"}`,
              backgroundColor: "#1c1c24",
              color: disabled ? "#555568" : "#f1f1f5",
              border: `1.5px solid ${error ? "#f87171" : disabled ? "#1e1e28" : "#2e2e3d"}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "1.5",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
              cursor: disabled ? "not-allowed" : "text",
              opacity: disabled ? 0.6 : 1,
              boxSizing: "border-box",
              appearance: "none",
              WebkitAppearance: "none",
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = error ? "#f87171" : "#6366f1";
                e.currentTarget.style.boxShadow = error
                  ? "0 0 0 3px rgba(248, 113, 113, 0.12)"
                  : "0 0 0 3px rgba(99, 102, 241, 0.15)";
                e.currentTarget.style.backgroundColor = "#20202a";
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "#f87171" : "#2e2e3d";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.backgroundColor = "#1c1c24";
              props.onBlur?.(e);
            }}
            onMouseEnter={(e) => {
              if (!disabled && document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = error ? "#f87171" : "#3e3e52";
                e.currentTarget.style.backgroundColor = "#1e1e28";
              }
              props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
              if (!disabled && document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = error ? "#f87171" : "#2e2e3d";
                e.currentTarget.style.backgroundColor = "#1c1c24";
              }
              props.onMouseLeave?.(e);
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: "absolute",
                right: "12px",
                display: "flex",
                alignItems: "center",
                color: error ? "#f87171" : disabled ? "#555568" : "#6b6b85",
                pointerEvents: "none",
                zIndex: 1,
                fontSize: "16px",
                transition: "color 0.2s ease",
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <span
            role="alert"
            style={{
              fontSize: "12px",
              color: "#f87171",
              fontWeight: 400,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              lineHeight: "1.4",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0, marginTop: "1px" }}
            >
              <circle cx="6" cy="6" r="5.5" stroke="#f87171" />
              <path d="M6 3.5V6.5" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.6" fill="#f87171" />
            </svg>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span
            style={{
              fontSize: "12px",
              color: "#6b6b85",
              fontWeight: 400,
              lineHeight: "1.4",
            }}
          >
            {helperText}
          </span>
        )}

        <style>{`
          input::placeholder {
            color: #4a4a62;
            opacity: 1;
          }
          input::-webkit-input-placeholder {
            color: #4a4a62;
          }
          input::-moz-placeholder {
            color: #4a4a62;
            opacity: 1;
          }
          input:-ms-input-placeholder {
            color: #4a4a62;
          }
          input:disabled::placeholder {
            color: #3a3a4f;
          }
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;