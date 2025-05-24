// Shortens a string to given length adding a '_' suffix if cut:
export const shorten = (txt: string, len: number): string =>
  txt.substring(0, len) + (txt.length <= len ? '' : '_');
