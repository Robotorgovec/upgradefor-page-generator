declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  cwd(): string;
  argv: string[];
  exitCode?: number;
  exit(code?: number): void;
};

declare module "fs" {
  export const promises: {
    readFile(path: string, encoding?: string): Promise<string>;
  };
}

declare module "path" {
  export function join(...parts: string[]): string;
  const pathDefault: {
    join: typeof join;
  };
  export default pathDefault;
}

declare module "crypto" {
  export interface RandomBytes {
    toString(encoding?: string): string;
  }

  export interface Hash {
    update(data: string): Hash;
    digest(encoding?: string): string;
  }

  export function randomBytes(size: number): RandomBytes;
  export function createHash(algorithm: string): Hash;

  const crypto: {
    randomBytes: typeof randomBytes;
    createHash: typeof createHash;
  };

  export default crypto;
}
