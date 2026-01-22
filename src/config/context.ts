import type { Prettify } from "../utils.js";

type ServerContextVariables = Prettify<Record<string, never>>;

export type ServerContext = Prettify<{
    Variables: ServerContextVariables;
}>;
