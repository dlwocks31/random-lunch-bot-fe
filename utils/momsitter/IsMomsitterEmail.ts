export function isMomsitterEmail(email: unknown) {
  return (
    typeof email === "string" &&
    (email === "test@test.com" || email.endsWith("@mfort.co.kr"))
  );
}
