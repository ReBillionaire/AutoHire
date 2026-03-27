import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    orgId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: string;
      orgId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    orgId: string | null;
  }
}
