export const MentionedUser = ({ name }: { name: string }) => {
  return (
    <div
      style={{
        background: "rgba(29,155,209,.1)",
        color: "rgba(18,100,163,1)",
        margin: "0 2px",
        padding: "2px",
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      @{name}
    </div>
  );
};
