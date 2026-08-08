export default async function CallbackPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return <h1>Callback: {provider}</h1>;
}
