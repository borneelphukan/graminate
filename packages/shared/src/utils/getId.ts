export const getId = (
  id: string | { id: string } | undefined | null
): string | undefined => {
  return typeof id === "string" ? id : id?.id;
};
