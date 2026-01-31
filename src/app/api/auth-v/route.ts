import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/utils/verifyUserAuth";

export async function GET(
  req: NextRequest
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    return NextResponse.json({ message: "Registro obtido", userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro Auth-V" }, { status: 500 });
  }
}

