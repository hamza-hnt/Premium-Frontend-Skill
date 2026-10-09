import type { Catalogue, Component, Variant } from "../registry/schema.js";

export interface DiscoverOptions {
  revision?: string;
  checkedDate: string;
  offline?: boolean;
}
export interface RetrievedFile {
  path: string;
  content: Buffer;
  sha256: string;
}
export interface Provider {
  id: string;
  discover(options: DiscoverOptions): Promise<Catalogue>;
  retrieve(
    component: Component,
    variant: Variant,
    offline?: boolean,
  ): Promise<RetrievedFile[]>;
}
