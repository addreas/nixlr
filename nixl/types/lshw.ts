
export type LshwNode = {
  id: string;
  claimed: boolean;
  class: string;
  handle: string;

  modalias?: string;
  description?: string;
  product?: string;
  vendor?: string;
  physid?: string | number;
  businfo?: string;
  logicalname?: string;
  dev?: string;
  version?: string | number;
  date?: string;
  serial?: string | number;
  slot?: string;

  size?: { unit: string; value: number };
  capacity?: { unit: string; value: number };
  widthBits?: number;
  clockHz?: number;
  configuration?: { [setting: string]: string | number };
  capabilities?: { id: string; description?: string }[];
  resources?: { [resource: string]: string | number };
  hints?: { [hint: string]: string };

  children?: LshwNode[];
};
