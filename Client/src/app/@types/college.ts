export type Regulation = {
  type: string;
  regulation: string;
  validYears: number[];
};

export type Program = {
  name: string;
  specializations: string[];
  years: number[];
  regulations: Regulation[];
};

export type CollegeDetails = {
  address: string;
  contactNumber: string;
  email: string;
};

export type CollegeData = {
  _id?: string;
  collegeName: string;
  regulatoryBody: string;
  domain: string;
  details: CollegeDetails;
  programs: Program[];
  createdAt?: string;
  updatedAt?: string;
};

export type CollegeExportData = {
  collegeName: string;
  regulatoryBody: string;
  domain: string;
}
