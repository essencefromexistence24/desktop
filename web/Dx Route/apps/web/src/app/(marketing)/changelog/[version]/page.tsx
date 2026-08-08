export default async function ChangelogVersionPage({
  params,
}: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  return <h1>Changelog {version}</h1>;
}
