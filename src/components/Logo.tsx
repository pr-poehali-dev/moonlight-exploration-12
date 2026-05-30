export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* AI circuit icon */}
      <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="6" fill="hsl(48 100% 50%)" />
      <line x1="20" y1="6" x2="20" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="20" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="20" x2="10" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="20" x2="34" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.1" y1="10.1" x2="13" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="27" x2="29.9" y2="29.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29.9" y1="10.1" x2="27" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="27" x2="10.1" y2="29.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* КИРА text */}
      <text
        x="44"
        y="27"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="white"
        letterSpacing="3"
      >
        КИРА
      </text>
    </svg>
  );
};
