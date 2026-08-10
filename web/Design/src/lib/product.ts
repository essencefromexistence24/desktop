export const productName = "Design";
export const productDescription =
  "Create, organize, and publish visual design projects in one focused workspace.";
export const productEmailFrom =
  process.env.BREVO_FROM_EMAIL?.trim() ||
  process.env.SMTP_FROM?.trim() ||
  "ajju40959@gmail.com";
export const productEmailFromName =
  process.env.BREVO_FROM_NAME?.trim() || productName;
export const productEmailIssuer = "Essence Studio";
export const productUserAgent = "EssenceStudio/0.1";
