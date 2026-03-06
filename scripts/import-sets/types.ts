export type RebrickableTheme = {
  id: number;
  parent_id: number | null;
  name: string;
};

export type RebrickableSet = {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string | null;
};

export type RebrickableListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type NormalizedSet = {
  set_num: string;
  name: string;
  theme: string;
  year: number;
  image_url: string | null;
  msrp_eur: null;
};

export type ImportOptions = {
  yearMin?: number;
  dryRun: boolean;
};

export type ImportStats = {
  fetched: number;
  normalized: number;
  inserted: number;
  updated: number;
  skipped: number;
};
