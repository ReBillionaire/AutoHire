import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    company: z.string().min(1, "Company name is required"),
});

export async function POST(request: Request) {
    try {
          const body = await request.json();
          const validated = registerSchema.safeParse(body);

      if (!validated.success) {
              return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
                      );
      }

      const { name, email, password, company } = validated.data;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
              where: { email },
      });

      if (existingUser) {
              return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
                      );
      }

      const hashedPassword = await hash(password, 12);

      // Create user and company in a transaction
      const result = await prisma.$transaction(async (tx) => {
              const user = await tx.user.create({
                        data: {
                                    name,
                                    email,
                                    password: hashedPassword,
                                    role: "ADMIN",
                        },
              });

                                                     const slug = company
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

                                                     const newCompany = await tx.company.create({
                                                               data: {
                                                                           name: company,
                                                                           slug,
                                                                           ownerId: user.id,
                                                               },
                                                     });

                                                     // Add user as OWNER member of the company
                                                     await tx.companyMember.create({
                                                               data: {
                                                                           companyId: newCompany.id,
                                                                           email,
                                                                           role: "OWNER",
                                                                           status: "ACCEPTED",
                                                               },
                                                     });

                                                     return { user, company: newCompany };
      });

      return NextResponse.json(
        {
                  success: true,
                  user: {
                              id: result.user.id,
                              name: result.user.name,
                              email: result.user.email,
                  },
        },
        { status: 201 }
            );
    } catch (error: any) {
          console.error("Registration error:", error);
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
                );
    }
}
