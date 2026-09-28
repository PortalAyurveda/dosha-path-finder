export const MarcaPortal = ({ size = "10mm" }: { size?: string }) => (
  <svg viewBox="0 0 120.32 120.17" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden="true">
    <path fill="#ff8f8f" d="M120.32,120.17c-21.92-1.21-41.82-12.92-53.5-31.45h53.5v31.45Z" />
    <path fill="#6e81ff" d="M119.22,70.17c-13.34-17.6-35.27-28.05-59.1-28.05S14.41,52.57,1.09,70.17C8.75,26.39,35.17,10.11,60.16,0c24.99,10.11,51.42,26.4,59.06,70.17Z" />
    <path fill="#ff8f8f" d="M0,88.72h53.49c-11.68,18.53-31.58,30.24-53.49,31.45v-31.45Z" />
    <path fill="#f2cd00" d="M2.83,81.05c11.81-19.23,34.16-31.61,57.19-31.61h.28c23.04,0,45.39,12.38,57.2,31.61H2.83Z" />
  </svg>
);

export const Quadradinho = ({ mm }: { mm: string }) => (
  <span
    style={{
      display: "inline-block",
      width: mm,
      height: mm,
      border: "1pt solid #000",
      flexShrink: 0,
      marginRight: "3mm",
    }}
  />
);
