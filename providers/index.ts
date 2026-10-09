import type { Provider } from "./types.js";
import { ReactBitsProvider } from "./react-bits.js";
export function getProvider(id: string): Provider {
  if (id === "react-bits") return new ReactBitsProvider();
  throw new Error(`Unsupported provider: ${id}. V1 supports react-bits.`);
}
