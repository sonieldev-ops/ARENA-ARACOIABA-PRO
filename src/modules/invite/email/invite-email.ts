import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  teamName,
  inviteLink,
  invitedByName
}: {
  to: string;
  teamName: string;
  inviteLink: string;
  invitedByName: string;
}) {
  const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background-color: #2563eb; padding: 32px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ARENA ARACOIABA PRO</h2>
      </div>

      <!-- Content -->
      <div style="padding: 40px; text-align: center;">
        <div style="margin-bottom: 24px;">
           <span style="background-color: #eff6ff; color: #2563eb; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Convocação Oficial</span>
        </div>

        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 8px;">Olá,</p>
        <p style="color: #1f2937; font-size: 18px; line-height: 28px; margin-bottom: 32px;">
          <b>${invitedByName}</b> convidou você para fazer parte do elenco oficial do time:
        </p>

        <h1 style="color: #111827; font-size: 36px; font-weight: 900; margin: 0 0 40px 0; letter-spacing: -1px;">${teamName}</h1>

        <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 18px 36px; border-radius: 12px; font-size: 18px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
          ACEITAR CONVITE
        </a>

        <p style="color: #9ca3af; font-size: 14px; margin-top: 40px;">
          Este convite expira em 7 dias.<br>
          Se você não conhece este time, pode ignorar este e-mail.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2024 Arena Aracoiaba Pro. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
  `;

  return resend.emails.send({
    from: "Arena Aracoiaba Pro <convites@arenaaracoiaba.com.br>", // Nota: Substituir pelo domínio verificado no Resend
    to,
    subject: `⚽ Você foi convocado para o time ${teamName}!`,
    html: html,
  });
}
