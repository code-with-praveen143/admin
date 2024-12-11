export interface User {
    id: any;
    username: string;
    email: string;
    password: string;
    role: 'Admin' | 'Uploader';
    active: boolean;
  }