import { prisma } from "@/lib/prisma";
import { RegisterClient } from "./RegisterClient";

interface Props {
  params: { token: string };
}

export default async function RegisterPage({ params }: Props) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
  });

  const now = new Date();

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Invalid Invite Link</h1>
          <p className="text-muted-foreground">This invite link is not valid.</p>
        </div>
      </div>
    );
  }

  if (invite.usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Invite Already Used</h1>
          <p className="text-muted-foreground">This invite link has already been used.</p>
        </div>
      </div>
    );
  }

  if (invite.expiresAt < now) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Invite Expired</h1>
          <p className="text-muted-foreground">This invite link has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  return <RegisterClient token={params.token} defaultEmail={invite.email ?? ""} />;
}
