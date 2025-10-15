export interface MuseJob {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
  refs: {
    landing_page: string;
  };
}

export interface MuseApiResponse {
  page: number;
  results: MuseJob[];
  total: number;
  page_count: number;
}
